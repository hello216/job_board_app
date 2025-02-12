using Microsoft.EntityFrameworkCore;
using Backend.Models;
using Backend.Data;
using DotNetEnv;
using Backend.Services;

var builder = WebApplication.CreateBuilder(args);

Env.Load();

var environment = Environment.GetEnvironmentVariable("ASPNETCORE_ENVIRONMENT") ?? "Development";
string applicationUrl = environment == "Production"
    ? "https://localhost:5000"
    : "https://localhost:7190";

builder.WebHost.UseUrls(applicationUrl);

// Load the database path from the environment variable
string dbPath = Environment.GetEnvironmentVariable("DB_PATH") ?? "jobs.db";

builder.Services.AddControllers();

builder.Services.AddDbContext<AppDbContext>(options =>
    options.UseSqlite($"Data Source={dbPath}"));

builder.Services.AddSingleton<JwtService>();

builder.Services.AddCors(options =>
{
    var allowedOrigins = (Environment.GetEnvironmentVariable("ALLOWED_ORIGINS") ?? "http://localhost:3000,https://localhost:3000")
                         .Split(',')
                         .Select(o => o.Trim())
                         .ToArray();

    options.AddPolicy("AllowSpecificOrigin",
        builder =>
        {
            builder.WithOrigins(allowedOrigins)
                   .AllowAnyMethod()
                   .AllowAnyHeader()
                   .AllowCredentials();
        });
});

var app = builder.Build();

app.UseCors("AllowSpecificOrigin");

app.MapControllers();
app.Run();