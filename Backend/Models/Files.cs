using System.ComponentModel.DataAnnotations;
using System.Collections.Generic;
using System;

namespace Backend.Models;

public enum FileType
{
    CoverLetter,
    Resume,
}

public class Files
{
    [Key]
    public string Id { get; set; } = Guid.NewGuid().ToString();

    [Required]
    [EnumDataType(typeof(FileType))]
    public FileType FileType { get; set; } = FileType.Resume;

    [Required]
    [StringLength(30)]
    public string Name { get; set; } = string.Empty;

    [Required]
    public string Hash { get; set; } = string.Empty;

    [Required]
    public long SizeInBytes { get; set; }

    public DateTime CreatedAt { get; private set; } = DateTime.UtcNow;
    public DateTime UpdatedAt { get; private set; } = DateTime.UtcNow;

    public string UserId { get; set; }
    public Users User { get; set; }

    public List<Jobs> Jobs { get; set; } = new List<Jobs>();

    public void UpdateTimestamps()
    {
        UpdatedAt = DateTime.UtcNow;
    }
}