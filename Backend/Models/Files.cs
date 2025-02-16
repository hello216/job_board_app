using System;
using System.ComponentModel.DataAnnotations;

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

    public ICollection<JobFileRel> JobFileRel { get; set; } = new List<JobFileRel>();

    public void UpdateTimestamps()
    {
        UpdatedAt = DateTime.UtcNow;
    }
}