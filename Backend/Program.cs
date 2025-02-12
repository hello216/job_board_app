using Microsoft.EntityFrameworkCore;
using Backend.Models;
using Backend.Data;
using DotNetEnv;
using Backend.Services;

var builder = WebApplication.CreateBuilder(args);

// Load environment variables from .env file
Env.Load();

var environment = Environment.GetEnvironmentVariable("ASPNETCORE_ENVIRONMENT") ?? "Development";
string applicationUrl = environment == "Production"
    ? "https://localhost:5000"
    : "http://localhost:7190";

builder.WebHost.UseUrls(applicationUrl);

builder.Services.AddControllers();

// Add DbContext for SQLite
builder.Services.AddDbContext<AppDbContext>(options =>
    options.UseSqlite(builder.Configuration.GetConnectionString("DefaultConnection")));

// Add the JwtService
builder.Services.AddSingleton<JwtService>();

string corsOrigins = Environment.GetEnvironmentVariable("ALLOWED_ORIGINS") ?? "http://localhost:3000";
var allowedOrigins = corsOrigins.Split(',');

builder.Services.AddCors(options =>
{
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