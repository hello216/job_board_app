using System;
using System.ComponentModel.DataAnnotations;

namespace Backend.Models;

public class JobFileRel
{
    [Key]
    public int Id { get; set; } = 0;

    [Required]
    public string JobId { get; set; } = string.Empty;

    [Required]
    public Jobs Job { get; set; }

    [Required]
    public string FileId { get; set; } = string.Empty;

    [Required]
    public Files File { get; set; }

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}