using System.ComponentModel.DataAnnotations;
using Microsoft.AspNetCore.Mvc;
using Backend.Models;
using Backend.Data;
using Backend.Services;
using Microsoft.Extensions.Logging;
using Microsoft.EntityFrameworkCore;
using System.Reflection;
using System.Linq;
using Microsoft.AspNetCore.RateLimiting;

namespace Backend.Controllers;

[Route("api/[controller]")]
[ApiController]
public class JobsController : ControllerBase
{
    private readonly AppDbContext _context;
    private readonly JwtService _jwtService;
    private readonly ILogger<JobsController> _logger;
    private readonly ICookieEncryptionService _cookieEncryptionService;

    public JobsController(AppDbContext context, JwtService jwtService, ILogger<JobsController> logger,
        ICookieEncryptionService cookieEncryptionService)
    {
        _context = context;
        _jwtService = jwtService;
        _logger = logger;
        _cookieEncryptionService = cookieEncryptionService;
    }

    [EnableRateLimiting("FixedWindow")]
    [HttpPost]
    public async Task<ActionResult> Create(CreateJobRequest request)
    {
        if (!IsAuthenticated())
            return Unauthorized("No authentication token provided.");

        try
        {
            if (request.Title == null || request.Company == null || request.Url == null || request.Location == null)
            {
                return BadRequest("Required fields cannot be null.");
            }

            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState.Values.SelectMany(v => v.Errors));
            }

            // Convert string status to JobStatus enum
            if (!Enum.TryParse(request.Status, true, out JobStatus status))
            {
                return BadRequest("Invalid status provided.");
            }

            var currentUserId = GetCurrentUserId();
            if (currentUserId == null)
            {
                return Unauthorized("No authentication token provided.");
            }

            var user = await _context.Users.FindAsync(currentUserId);
            if (user == null)
            {
                return NotFound("User not found.");
            }

            var job = new Jobs
            {
                UserId = user.Id,
                User = user,
                Status = status,
                Title = request.Title!,
                Company = request.Company!,
                Url = request.Url!,
                Location = request.Location!,
                Note = request.Note ?? "No notes yet...",
            };

            _context.Jobs.Add(job);
            CreateJobStatusHistory(job, job.Status);
            await _context.SaveChangesAsync();

            return Ok(new { message = "Job created successfully.", jobId = job.Id });
        }
        catch (Exception ex)
        {
            _logger.LogError($"Failed to create job: {ex.Message}", ex);
            return StatusCode(500, "Internal Server Error");
        }
    }

    [EnableRateLimiting("FixedWindow")]
    [HttpGet("{id}")]
    public async Task<ActionResult> Get(string id)
    {
        if (!IsAuthenticated())
            return Unauthorized("No authentication token provided.");

        try
        {
            var currentUserId = GetCurrentUserId();
            if (currentUserId == null)
            {
                return Unauthorized("No authentication token provided.");
            }

            var job = await _context.Jobs
                .Where(j => j.Id == id)
                .Include(j => j.Files)
                .Select(j => new
                {
                    j.Id,
                    Status = j.Status.ToString(),
                    j.Title,
                    j.Company,
                    j.Url,
                    j.Location,
                    j.Note,
                    j.CreatedAt,
                    j.UpdatedAt,
                    j.UserId,
                    Files = j.Files.Select(f => new
                    {
                        f.Id,
                    })
                })
                .FirstOrDefaultAsync();

            if (job == null)
            {
                return NotFound("Job not found.");
            }

            // Ensure the job belongs to the current user
            if (job.UserId != currentUserId)
            {
                return Unauthorized("Not authorized to access this resource.");
            }

            return Ok(job);
        }
        catch (Exception ex)
        {
            _logger.LogError($"Failed to get job: {ex.Message}", ex);
            return StatusCode(500, "Internal Server Error");
        }
    }

    [EnableRateLimiting("FixedWindow")]
    [HttpGet("getuserjobs")]
    public async Task<ActionResult> GetUserJobs()
    {
        if (!IsAuthenticated())
            return Unauthorized("No authentication token provided.");

        try
        {
            var currentUserId = GetCurrentUserId();
            if (currentUserId == null)
            {
                return Unauthorized("No authentication token provided.");
            }

            var user = await _context.Users.FindAsync(currentUserId);
            if (user == null)
            {
                return NotFound("User not found.");
            }

            var jobs = await _context.Jobs
                .Where(j => j.UserId == user.Id)
                .Select(j => new
                {
                    j.Id,
                    Status = j.Status.ToString(),
                    j.Title,
                    j.Company,
                    j.Url,
                    j.Location,
                    j.Note,
                    j.CreatedAt,
                    j.UpdatedAt,
                })
                .ToArrayAsync();

            return Ok(jobs);
        }
        catch (Exception ex)
        {
            _logger.LogError($"Failed to get user's jobs: {ex.Message}", ex);
            return StatusCode(500, "Internal Server Error");
        }
    }

    [EnableRateLimiting("FixedWindow")]
    [HttpPut("{id}")]
    public async Task<ActionResult> Update(string id, UpdateJobRequest request)
    {
        if (!IsAuthenticated())
        {
            return Unauthorized("No authentication token provided.");
        }

        if (!ModelState.IsValid)
        {
            return BadRequest(ModelState.Values.SelectMany(v => v.Errors));
        }

        try
        {
            var currentUserId = GetCurrentUserId();
            if (currentUserId == null)
            {
                return StatusCode(500, "Failed to retrieve current user's ID.");
            }

            var user = await _context.Users.FindAsync(currentUserId);
            if (user == null)
            {
                return StatusCode(500, "User not found.");
            }

            var jobToUpdate = await _context.Jobs.FindAsync(id);
            if (jobToUpdate == null)
            {
                return NotFound("Job not found.");
            }

            if (jobToUpdate.User != user)
            {
                return Unauthorized("You are not authorized to update this job.");
            }

            JobStatus? status = null;
            if (request.Status != null && Enum.TryParse(request.Status, true, out JobStatus parsedStatus))
            {
                status = parsedStatus;
                // Create the new JobStatusHistory instance if the status its being changed
                if (parsedStatus != jobToUpdate.Status) // Only log if status changes
                {
                    CreateJobStatusHistory(jobToUpdate, parsedStatus);

                    jobToUpdate.Status = parsedStatus;
                }
                else
                {
                    jobToUpdate.Status = parsedStatus;
                }
            }

            jobToUpdate.Status = status ?? jobToUpdate.Status;
            jobToUpdate.Title = request.Title ?? jobToUpdate.Title;
            jobToUpdate.Company = request.Company ?? jobToUpdate.Company;
            jobToUpdate.Url = request.Url ?? jobToUpdate.Url;
            jobToUpdate.Location = request.Location ?? jobToUpdate.Location;
            jobToUpdate.Note = request.Note ?? jobToUpdate.Note;

            jobToUpdate.UpdateTimestamps();
            await _context.SaveChangesAsync();

            return Ok(new { message = "Update succesful." });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to update job.");
            return StatusCode(500, "Internal Server Error");
        }
    }

    [EnableRateLimiting("FixedWindow")]
    [HttpDelete("{id}")]
    public async Task<ActionResult> Delete(string id)
    {
        if (!IsAuthenticated())
        {
            return Unauthorized("No authentication token provided.");
        }

        try
        {
            var currentUserId = GetCurrentUserId();
            if (currentUserId == null)
            {
                return StatusCode(500, "Failed to retrieve current user's ID.");
            }

            var user = await _context.Users.FindAsync(currentUserId);
            if (user == null)
            {
                return StatusCode(500, "User not found.");
            }

            var job = await _context.Jobs.FindAsync(id);
            if (job == null)
            {
                return NotFound("Job not found.");
            }

            if (job.User != user)
            {
                return Unauthorized("You are not authorized to delete this job.");
            }

            _context.Jobs.Remove(job);
            await _context.SaveChangesAsync();
            return NoContent();
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to delete job.");
            return StatusCode(500, "Internal Server Error");
        }
    }

    [EnableRateLimiting("FixedWindow")]
    [HttpGet("getstatuses")]
    public IActionResult GetJobStatuses()
    {
        if (!IsAuthenticated())
            return Unauthorized("No authentication token provided.");

        try
        {
            var types = typeof(JobStatus).GetFields(BindingFlags.Public | BindingFlags.Static);
            var statuses = types
                .Where(t => t.FieldType == typeof(JobStatus)) // Ensure the field is of type JobStatus
                .Select(t =>
                {
                   var displayAttribute = t.GetCustomAttributes(typeof(DisplayAttribute), false).FirstOrDefault() as DisplayAttribute;
                   var name = displayAttribute?.Name ?? t.Name; // Check for non null values

                   // Safe unboxing with explicit check for null values
                   var value = t.GetValue(null);
                   if (value is JobStatus statusValue) // Check the value type safely
                   {
                       return new
                       {
                           Id = (int)(object)statusValue, // Cast to object, then to int
                           Name = name,
                           Value = t.Name
                       };
                   }

                   return null; // Or handle the case where value is null
                })
                .Where(status => status != null); // Filter out any null entries

            return Ok(statuses);
        }
        catch (Exception ex)
        {
            _logger.LogError($"Failed to get job statuses: {ex.Message}", ex);
            return StatusCode(500, "Internal Server Error");
        }
    }

    [EnableRateLimiting("FixedWindow")]
    [HttpGet("statushistory")]
    public async Task<ActionResult<IEnumerable<JobStatusHistory>>> GetJobStatusHistory()
    {
        var currentUserId = GetCurrentUserId();
        if (currentUserId == null)
        {
            return Unauthorized("No authentication token provided.");
        }

        try
        {
            var userJobs = await _context.Jobs
                .Include(j => j.StatusHistories)
                .Where(j => j.UserId == currentUserId)
                .SelectMany(j => j.StatusHistories)
                .ToListAsync();

            return Ok(userJobs);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to fetch job status history");
            return StatusCode(500, "Internal Server Error");
        }
    }

    private bool IsAuthenticated()
    {
        if (Request.Cookies.TryGetValue("authToken", out var encryptedToken))
        {
            var token = _cookieEncryptionService.Decrypt(encryptedToken);
            // Checking for null ensures the method doesn't throw when decrypting fails or token is missing.
            return token != null && _jwtService.IsAuthenticated(token);
        }
        else
        {
            return false;
        }
    }

    private string? GetCurrentUserId()
    {
        if (Request.Cookies.TryGetValue("authToken", out var encryptedToken))
        {
            var token = _cookieEncryptionService.Decrypt(encryptedToken);
            // Checking for null ensures the method doesn't throw when decrypting fails or token is missing.
            return token != null ? _jwtService.GetUserIdFromToken(token) : null;
        }
        else
        {
            return null;
        }
    }

    private void CreateJobStatusHistory(Jobs job, JobStatus status)
    {
        var jobStatusHistory = new JobStatusHistory(job.Id, status);
        job.StatusHistories.Add(jobStatusHistory);
    }
}

public class CreateJobRequest
{
    public string? Status { get; set; }

    [Required]
    [StringLength(30)]
    public string? Title { get; set; }

    [Required]
    [StringLength(30)]
    public string? Company { get; set; }

    [Required]
    [Url]
    public string? Url { get; set; }

    [Required]
    [StringLength(30)]
    public string? Location { get; set; }

    [StringLength(1000)]
    public string? Note { get; set; }
}

public class UpdateJobRequest
{
    public string? Status { get; set; }

    [StringLength(30)]
    public string? Title { get; set; }

    [StringLength(30)]
    public string? Company { get; set; }

    [Url]
    public string? Url { get; set; }

    [StringLength(30)]
    public string? Location { get; set; }

    [StringLength(1000)]
    public string? Note { get; set; }
}