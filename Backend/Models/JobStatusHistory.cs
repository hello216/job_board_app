using System;
using System.ComponentModel.DataAnnotations;

namespace Backend.Models;

public class JobStatusHistory
{
    [Key]
    public int Id { get; set; }
    public string JobId { get; set; }
    public JobStatus Status { get; set; }
    public DateTime ChangedAt { get; set; } = DateTime.UtcNow;

    public Jobs Job { get; set; }
}