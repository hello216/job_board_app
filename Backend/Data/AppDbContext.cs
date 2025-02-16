using Microsoft.EntityFrameworkCore;
using Backend.Models;

namespace Backend.Data;

public class AppDbContext : DbContext
{
    public AppDbContext(DbContextOptions<AppDbContext> options) : base(options)
    {
    }

    public DbSet<Users> Users { get; set; }
    public DbSet<Jobs> Jobs { get; set; }
    public DbSet<JobStatusHistory> JobStatusHistories { get; set; }
    public DbSet<Files> Files { get; set; }
    public DbSet<JobFileRel> JobFileRels { get; set; }

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<Users>()
            .Property(u => u.Id)
            .ValueGeneratedOnAdd();

        modelBuilder.Entity<Users>()
            .HasIndex(u => u.Email)
            .IsUnique();

        modelBuilder.Entity<Jobs>()
            .HasOne(j => j.User)
            .WithMany(u => u.Jobs)
            .HasForeignKey(j => j.UserId);

        modelBuilder.Entity<Jobs>()
            .Property(j => j.Id)
            .ValueGeneratedOnAdd();

        modelBuilder.Entity<JobStatusHistory>()
            .HasOne(jsh => jsh.Job)
            .WithMany(j => j.StatusHistories)
            .HasForeignKey(jsh => jsh.JobId);

        modelBuilder.Entity<JobStatusHistory>()
            .Property(jsh => jsh.ChangedAt)
            .HasDefaultValueSql("getutcdate()");

        modelBuilder.Entity<JobFileRel>()
            .HasKey(jfa => jfa.Id);

        modelBuilder.Entity<JobFileRel>()
            .HasOne(jfa => jfa.Job)
            .WithMany(j => j.JobFileRels)
            .HasForeignKey(jfa => jfa.JobId);

        modelBuilder.Entity<JobFileRel>()
            .HasOne(jfa => jfa.File)
            .WithMany(f => f.JobFileRel)
            .HasForeignKey(jfa => jfa.FileId);
    }
}