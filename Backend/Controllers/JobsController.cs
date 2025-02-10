using System.ComponentModel.DataAnnotations;
using Microsoft.AspNetCore.Mvc;
using Backend.Models;
using Backend.Data;
using Backend.Services;
using Microsoft.Extensions.Logging;
using Microsoft.EntityFrameworkCore;
using System.Reflection;
using System.Linq;

namespace Backend.Controllers;

[Route("api/[controller]")]
[ApiController]
public class JobsController : ControllerBase
{
    private readonly AppDbContext _context;
    private readonly JwtService _jwtService;
    private readonly ILogger<JobsController> _logger;

    public JobsController(AppDbContext context, JwtService jwtService, ILogger<JobsController> logger)
    {
        _context = context;
        _jwtService = jwtService;
        _logger = logger;
    }

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
                Note = request.Note
            };

            _context.Jobs.Add(job);
            await _context.SaveChangesAsync();

            return Ok(new
            {
                Id = job.Id,
                Status = job.Status,
                Title = job.Title,
                Company = job.Company,
                Url = job.Url,
                Location = job.Location,
                Note = job.Note,
                CreatedAt = job.CreatedAt,
                UpdatedAt = job.UpdatedAt,
                UserId = job.UserId
            });
        }
        catch (Exception ex)
        {
            _logger.LogError($"Failed to create job: {ex.Message}", ex);
            return StatusCode(500, "Internal Server Error");
        }
    }

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

            var user = await _context.Users.FindAsync(currentUserId);
            if (user == null)
            {
                return NotFound("User not found.");
            }

            var job = await _context.Jobs.FindAsync(id);
            if (job == null)
            {
                return NotFound("Job not found.");
            }

            if (job.User != user)
            {
                return Unauthorized("Not authorized to access this resource.");
            }

            return Ok(new
            {
                job.Id,
                Status = job.Status.ToString(),
                job.Title,
                job.Company,
                job.Url,
                job.Location,
                job.Note,
                job.CreatedAt,
                job.UpdatedAt,
                job.UserId
            });
        }
        catch (Exception ex)
        {
            _logger.LogError($"Failed to get job: {ex.Message}", ex);
            return StatusCode(500, "Internal Server Error");
        }
    }

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
                    j.UserId
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
            }

            jobToUpdate.Status = status ?? jobToUpdate.Status;
            jobToUpdate.Title = request.Title ?? jobToUpdate.Title;
            jobToUpdate.Company = request.Company ?? jobToUpdate.Company;
            jobToUpdate.Url = request.Url ?? jobToUpdate.Url;
            jobToUpdate.Location = request.Location ?? jobToUpdate.Location;
            jobToUpdate.Note = request.Note ?? jobToUpdate.Note;

            jobToUpdate.UpdateTimestamps();
            await _context.SaveChangesAsync();
            return Ok(new
            {
                jobToUpdate.Id,
                Status = jobToUpdate.Status.ToString(),
                jobToUpdate.Title,
                jobToUpdate.Company,
                jobToUpdate.Url,
                jobToUpdate.Location,
                jobToUpdate.Note,
                jobToUpdate.CreatedAt,
                jobToUpdate.UpdatedAt,
                jobToUpdate.UserId
            });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to update job.");
            return StatusCode(500, "Internal Server Error");
        }
    }

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

    [HttpGet("getstatuses")]
    public IActionResult GetJobStatuses()
    {
        if (!IsAuthenticated())
            return Unauthorized("No authentication token provided.");

        try
        {
            var types = typeof(JobStatus).GetFields(BindingFlags.Public | BindingFlags.Static);
            var statuses = types.Select(t =>
            {
                var attribute = (DisplayAttribute)t.GetCustomAttributes(typeof(DisplayAttribute), false).FirstOrDefault();
                var name = attribute != null ? attribute.Name : t.Name;
                return new { Id = (int)t.GetValue(null), Name = name, Value = t.Name };
            });

            return Ok(statuses);
        }
        catch (Exception ex)
        {
            _logger.LogError($"Failed to get job statuses: {ex.Message}", ex);
            return StatusCode(500, "Internal Server Error");
        }
    }

    private bool IsAuthenticated()
    {
        if (Request.Cookies.TryGetValue("authToken", out var token))
        {
            return _jwtService.IsAuthenticated(token);
        }
        else
        {
            return false;
        }
    }

    private string? GetCurrentUserId()
    {
        if (Request.Cookies.TryGetValue("authToken", out var token))
        {
            return _jwtService.GetUserIdFromToken(token);
        }
        else
        {
            return null;
        }
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