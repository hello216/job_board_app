using System;
using System.ComponentModel.DataAnnotations;

namespace Backend.Models;

public enum JobStatus
{
    Applied,
    Interviewing,
    Offered,
    Accepted,
    Rejected,
    [Display(Name = "Not Interested")]
    NotInterested,
    Ghosted
}

public class Jobs
{
    [Key]
    public string Id { get; set; } = Guid.NewGuid().ToString();

    [Required]
    [EnumDataType(typeof(JobStatus))]
    public JobStatus Status { get; set; } = JobStatus.Applied;

    [Required]
    [StringLength(30)]
    public string Title { get; set; } = string.Empty;

    [Required]
    [StringLength(30)]
    public string Company { get; set; } = string.Empty;

    [Required]
    [Url]
    public string Url { get; set; } = string.Empty;

    [Required]
    [StringLength(30)]
    public string Location { get; set; } = string.Empty;

    [StringLength(1000)]
    public string Note { get; set; } = "No notes yet...";

    public DateTime CreatedAt { get; private set; } = DateTime.UtcNow;
    public DateTime UpdatedAt { get; private set; } = DateTime.UtcNow;

    public string UserId { get; set; }
    public Users User { get; set; }
    public ICollection<JobStatusHistory> StatusHistories { get; set; } = new List<JobStatusHistory>();
    public ICollection<JobFileRel> JobFileRels { get; set; } = new List<JobFileRel>();

    public void UpdateTimestamps()
    {
        UpdatedAt = DateTime.UtcNow;
    }
}