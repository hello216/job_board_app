using Microsoft.EntityFrameworkCore;
using Backend.Models;
using Backend.Data;
using DotNetEnv;
using Backend.Services;
using AspNetCoreRateLimit;

var builder = WebApplication.CreateBuilder(args);

Env.Load();

string applicationUrl = "http://localhost:5000";

builder.WebHost.UseUrls(applicationUrl);

string dbPath = Environment.GetEnvironmentVariable("DB_PATH") ?? "jobs.db";

builder.Services.AddOptions();
builder.Services.AddMemoryCache();
builder.Services.Configure<IpRateLimitOptions>(builder.Configuration.GetSection("IpRateLimiting"));
builder.Services.Configure<IpRateLimitPolicies>(builder.Configuration.GetSection("IpRateLimitPolicies"));
builder.Services.AddSingleton<IRateLimitCounterStore, MemoryCacheRateLimitCounterStore>();
builder.Services.AddSingleton<IRateLimitConfiguration, RateLimitConfiguration>();
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

app.UseIpRateLimiting();

app.MapControllers();
app.Run();