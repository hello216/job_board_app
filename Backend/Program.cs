using Microsoft.EntityFrameworkCore;
using Backend.Models;
using Backend.Data;
using DotNetEnv;
using Backend.Services;
using Microsoft.AspNetCore.RateLimiting;

var builder = WebApplication.CreateBuilder(args);

Env.Load();

string applicationUrl = "http://localhost:5000";

builder.WebHost.UseUrls(applicationUrl);

string dbPath = Environment.GetEnvironmentVariable("DB_PATH") ?? "jobs.db";

builder.Services.AddRateLimiter(_ =>
{
    _.AddFixedWindowLimiter(
        policyName: "FixedWindow",
        options =>
        {
            // Maximum allowed requests
            options.PermitLimit = 10;
            // Maximum allowed requests in queue
            options.QueueLimit = 3;
            // Time window
            options.Window = TimeSpan.FromMinutes(1);
        });

    _.AddFixedWindowLimiter(
        policyName: "AuthenticationLimit",
        options =>
        {
            // Maximum allowed requests
            options.PermitLimit = 4;
            // Maximum allowed requests in queue
            options.QueueLimit = 2;
            // Time window
            options.Window = TimeSpan.FromMinutes(1);
        });
});

builder.Services.AddControllers();

builder.Services.AddDbContext<AppDbContext>(options =>
    options.UseSqlite($"Data Source={dbPath}"));

builder.Services.AddSingleton<JwtService>();
builder.Services.AddSingleton<ICookieEncryptionService>(provider =>
{
    var encryptionKey = Environment.GetEnvironmentVariable("ENCRYPTION_KEY");
    return new CookieEncryptionService(encryptionKey);
});

builder.Services.AddCors(options =>
{
    var allowedOrigins = (Environment.GetEnvironmentVariable("ALLOWED_ORIGINS") ?? "http://localhost:3000")
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
app.UseRateLimiter();

app.MapControllers();
app.Run();