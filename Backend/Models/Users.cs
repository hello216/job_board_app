using System;
using System.ComponentModel.DataAnnotations;

namespace Backend.Models;

public class Users
{
    [Key]
    [StringLength(12)]
    public string Id { get; set; } = Guid.NewGuid().ToString().Substring(0, 12);

    [Required]
    [StringLength(254)]
    [EmailAddress]
    public string Email { get; set; } = string.Empty;

    [Required]
    [StringLength(75)]
    public string PasswordHash { get; set; } = string.Empty;

    public DateTime CreatedAt { get; private set; } = DateTime.UtcNow;
    public DateTime UpdatedAt { get; private set; } = DateTime.UtcNow;

    public void UpdateTimestamps()
    {
        UpdatedAt = DateTime.UtcNow;
    }
}