using Microsoft.EntityFrameworkCore;

namespace Backend.Models;

public class DbContext : DbContext
{
    public DbContext(DbContextOptions<TodoContext> options)
        : base(options)
    {
    }

    public DbSet<Users> Users { get; set; } = null!;
}