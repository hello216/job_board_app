using Microsoft.EntityFrameworkCore;
using Backend.Models;
using Backend.Data;
using DotNetEnv;
using Backend.Middleware;
using Backend.Services;

var builder = WebApplication.CreateBuilder(args);

// Load environment variables from .env file
Env.Load();

builder.Services.AddControllers();

builder.Services.AddDbContext<AppDbContext>(options =>
    options.UseSqlite(builder.Configuration.GetConnectionString("DefaultConnection")));

builder.Services.AddSingleton<JwtService>();

builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowSpecificOrigin",
        builder =>
        {
            builder.WithOrigins("http://localhost:3000", "https://localhost:3000")
                   .AllowAnyMethod()
                   .AllowAnyHeader()
                   .AllowCredentials();
        });
});

var app = builder.Build();

app.UseCors("AllowSpecificOrigin");

app.UseHttpsRedirection();

app.UseMiddleware<JwtCookieValidationMiddleware>();

app.MapControllers();

app.Run();