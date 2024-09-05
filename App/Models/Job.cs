using System;
using System.ComponentModel.DataAnnotations;

namespace App.Models;

public class Job
{   
    [Key]
    [StringLength(12)]
    public string Id { get; set; } = Guid.NewGuid().ToString().Substring(0, 12);
    
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
}

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
