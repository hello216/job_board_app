using System.ComponentModel.DataAnnotations;
using Microsoft.AspNetCore.Mvc;
using Backend.Models;
using Backend.Data;
using Backend.Services;
using Microsoft.Extensions.Logging;
using Microsoft.EntityFrameworkCore;

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
    public async Task<ActionResult<Jobs>> Create(CreateJobRequest request)
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
                Status = request.Status,
                Title = request.Title!,
                Company = request.Company!,
                Url = request.Url!,
                Location = request.Location!,
                Note = request.Note
            };

            _context.Jobs.Add(job);
            await _context.SaveChangesAsync();
            return CreatedAtAction(nameof(Get), new { id = job.Id }, job);
        }
        catch (Exception ex)
        {
            _logger.LogError("Failed to create job: {ex.Message}", ex);
            return StatusCode(500, "Internal Server Error");
        }
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<Jobs>> Get(string id)
    {
        if (!IsAuthenticated())
            return Unauthorized("No authentication token provided.");

        try
        {
            var job = await _context.Jobs.FindAsync(id);
            if (job == null)
            {
                return NotFound("Job not found.");
            }

            return Ok(job);
        }
        catch (Exception ex)
        {
            _logger.LogError("Failed to get job: {ex.Message}", ex);
            return StatusCode(500, "Internal Server Error");
        }
    }

    [HttpGet("getuserjobs")]
    public async Task<ActionResult<Jobs[]>> GetUserJobs()
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

            var jobs = await _context.Jobs.Where(j => j.UserId == user.Id).ToArrayAsync();
            return Ok(jobs);
        }
        catch (Exception ex)
        {
            _logger.LogError("Failed to get user's jobs: {ex.Message}", ex);
            return StatusCode(500, "Internal Server Error");
        }
    }

    [HttpPut("{id}")]
    public async Task<ActionResult<Jobs>> Update(string id, UpdateJobRequest request)
    {
        if (!IsAuthenticated())
            return Unauthorized("No authentication token provided.");

        if (!ModelState.IsValid)
        {
            return BadRequest(ModelState.Values.SelectMany(v => v.Errors));
        }

        try
        {
            var jobToUpdate = await _context.Jobs.FindAsync(id);
            if (jobToUpdate == null)
            {
                return NotFound("Job not found.");
            }

            jobToUpdate.Status = request.Status ?? jobToUpdate.Status;
            jobToUpdate.Title = request.Title ?? jobToUpdate.Title;
            jobToUpdate.Company = request.Company ?? jobToUpdate.Company;
            jobToUpdate.Url = request.Url ?? jobToUpdate.Url;
            jobToUpdate.Location = request.Location ?? jobToUpdate.Location;
            jobToUpdate.Note = request.Note ?? jobToUpdate.Note;

            jobToUpdate.UpdateTimestamps();
            await _context.SaveChangesAsync();
            return Ok(jobToUpdate);
        }
        catch (Exception ex)
        {
            _logger.LogError("Failed to update job: {ex.Message}", ex);
            return StatusCode(500, "Internal Server Error");
        }
    }

    [HttpDelete("{id}")]
    public async Task<ActionResult> Delete(string id)
    {
        if (!IsAuthenticated())
            return Unauthorized("No authentication token provided.");

        try
        {
            var job = await _context.Jobs.FindAsync(id);
            if (job == null)
            {
                return NotFound("Job not found.");
            }

            _context.Jobs.Remove(job);
            await _context.SaveChangesAsync();
            return NoContent();
        }
        catch (Exception ex)
        {
            _logger.LogError("Failed to delete job: {ex.Message}", ex);
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
    [EnumDataType(typeof(JobStatus))]
    public JobStatus Status { get; set; }

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
    [EnumDataType(typeof(JobStatus))]
    public JobStatus? Status { get; set; }

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