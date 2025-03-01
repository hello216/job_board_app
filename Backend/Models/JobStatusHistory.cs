using System;
using System.ComponentModel.DataAnnotations;

namespace Backend.Models;

public class JobStatusHistory
{
    [Key]
    public int Id { get; set; }
    [Required]
    public string JobId { get; set; }
    [Required]
    public JobStatus Status { get; set; }
    [Required]
    public DateTime ChangedAt { get; set; } = DateTime.UtcNow;

    public Jobs? Job { get; set; }

    public JobStatusHistory(string jobId, JobStatus status)
    {
        JobId = jobId;
        Status = status;
    }
}