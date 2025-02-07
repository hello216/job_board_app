using System.ComponentModel.DataAnnotations;
using Microsoft.AspNetCore.Mvc;
using Backend.Models;
using Backend.Data;

namespace Backend.Controllers;

[Route("api/[controller]")]
[ApiController]
public class JobsController : ControllerBase
{
    private readonly AppDbContext _context;

    public JobsController(AppDbContext context)
    {
        _context = context;
    }

    [HttpPost("{userId}")]
    public async Task<ActionResult<Jobs>> Create(string userId, CreateJobRequest request)
    {
        if (request.Title == null || request.Company == null || request.Url == null || request.Location == null)
        {
            return BadRequest("Required fields cannot be null.");
        }

        if (!ModelState.IsValid)
        {
            return BadRequest(ModelState.Values.SelectMany(v => v.Errors));
        }

        var user = await _context.Users.FindAsync(userId);
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

    [HttpGet("{id}")]
    public async Task<ActionResult<Jobs>> Get(string id)
    {
        var job = await _context.Jobs.FindAsync(id);
        if (job == null)
        {
            return NotFound("Job not found.");
        }

        return Ok(job);
    }

    [HttpPut("{id}")]
    public async Task<ActionResult<Jobs>> Update(string id, UpdateJobRequest request)
    {
        if (!ModelState.IsValid)
        {
            return BadRequest(ModelState.Values.SelectMany(v => v.Errors));
        }

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

    [HttpDelete("{id}")]
    public async Task<ActionResult> Delete(string id)
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