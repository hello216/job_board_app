using Microsoft.AspNetCore.Mvc;
using Backend.Models;
using Backend.Data;
using Backend.Services;
using Konscious.Security.Cryptography;
using System.Text;
using System.ComponentModel.DataAnnotations;
using System.Security.Cryptography;
using Microsoft.EntityFrameworkCore;
using System.Linq;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Authorization;
using Microsoft.Extensions.Logging;

namespace Backend.Controllers;

[Route("api/[controller]")]
[ApiController]
public class UserController : ControllerBase
{
    private readonly AppDbContext _context;
    private readonly JwtService _jwtService;
    private readonly ILogger<UserController> _logger;

    public UserController(AppDbContext context, JwtService jwtService, ILogger<UserController> logger)
    {
        _context = context;
        _jwtService = jwtService;
        _logger = logger;
    }

    [HttpPost]
    public async Task<ActionResult<Users>> Create(AddUserRequest request)
    {
        try
        {
            if (_context.Users.Any(u => u.Email == request.Email))
                return BadRequest("Email is already in use.");

            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState.Values.SelectMany(v => v.Errors));
            }

            if (request.Email == null || request.Password == null)
            {
                return BadRequest("Request is invalid.");
            }

            var user = new Users
            {
                Email = request.Email,
                PasswordHash = HashPassword(request.Password)
            };

            var userResponse = new UserResponse
            {
                Id = user.Id,
                Email = user.Email,
                CreatedAt = user.CreatedAt,
                UpdatedAt = user.UpdatedAt
            };

            _context.Users.Add(user);
            await _context.SaveChangesAsync();
            return CreatedAtAction(nameof(Create), new { id = user.Id }, user);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to create user.");
            return StatusCode(500, "Internal Server Error");
        }
    }

    [HttpGet]
    public async Task<ActionResult<UserResponse>> Get()
    {
        if (!IsAuthenticated())
            return Unauthorized("No authentication token provided.");

        try
        {
            var currentUserId = GetCurrentUserId();
            if (currentUserId == null)
            {
                return Unauthorized("Failed to retrieve current user's ID.");
            }

            var user = await _context.Users.FindAsync(currentUserId);
            if (user == null)
            {
                return Unauthorized("User not found.");
            }

            var userResponse = new UserResponse
            {
                Id = user.Id,
                Email = user.Email,
                CreatedAt = user.CreatedAt,
                UpdatedAt = user.UpdatedAt
            };

            return Ok(userResponse);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to get user.");
            return StatusCode(500, "Internal Server Error");
        }
    }

    [HttpPut]
    public async Task<ActionResult<UserResponse>> Update(UpdateUserRequest request)
    {
        if (!IsAuthenticated())
            return Unauthorized("No authentication token provided.");

        if (!ModelState.IsValid)
        {
            return BadRequest(ModelState.Values.SelectMany(v => v.Errors));
        }

        try
        {
            var currentUserId = GetCurrentUserId();
            if (currentUserId == null)
            {
                return Unauthorized("Failed to retrieve current user's ID.");
            }

            var userToUpdate = await _context.Users.FindAsync(currentUserId);
            if (userToUpdate == null)
            {
                return Unauthorized("User not found.");
            }

            if (request.Email != null)
            {
                userToUpdate.Email = request.Email;
            }

            if (request.Password != null && request.Password != string.Empty)
            {
                userToUpdate.PasswordHash = HashPassword(request.Password);
            }

            userToUpdate.UpdateTimestamps();
            await _context.SaveChangesAsync();

            var userResponse = new UserResponse
            {
                Id = userToUpdate.Id,
                Email = userToUpdate.Email,
                CreatedAt = userToUpdate.CreatedAt,
                UpdatedAt = userToUpdate.UpdatedAt
            };

            return Ok(userResponse);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to update user.");
            return StatusCode(500, "Internal Server Error");
        }
    }

    [HttpDelete]
    public async Task<ActionResult> Delete()
    {
        if (!IsAuthenticated())
            return Unauthorized("No authentication token provided.");

        try
        {
            var currentUserId = GetCurrentUserId();
            if (currentUserId == null)
            {
                return Unauthorized("Failed to retrieve current user's ID.");
            }

            var user = await _context.Users.FindAsync(currentUserId);
            if (user == null)
            {
                return Unauthorized("User not found.");
            }

            _context.Users.Remove(user);
            await _context.SaveChangesAsync();
            return NoContent();
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to delete user.");
            return StatusCode(500, "Internal Server Error");
        }
    }

    [HttpPost("login")]
    public async Task<ActionResult> Login(LoginRequest request)
    {
        try
        {
            if (!ModelState.IsValid) return BadRequest(ModelState.Values.SelectMany(v => v.Errors));

            var user = await _context.Users.FirstOrDefaultAsync(u => u.Email == request.Email);
            if (user == null)
            {
                return NotFound("User not found.");
            }

            if (!VerifyPassword(request.Password, user.PasswordHash))
            {
                return BadRequest("Invalid credentials.");
            }

            var token = _jwtService.GenerateJwt(user);

            var cookieOptions = new CookieOptions
            {
                HttpOnly = true,
                SameSite = SameSiteMode.Lax,
                Secure = true,
                Expires = DateTime.UtcNow.AddHours(1),
            };

            Response.Cookies.Append("authToken", token, cookieOptions);

            return Ok(new { message = "Login successful." });
        }
        catch (Exception ex)
        {
            _logger.LogError($"Login failed: {ex.Message}", ex);
            return StatusCode(500, "Internal Server Error");
        }
    }

    [HttpGet("check")]
    public IActionResult CheckAuthentication()
    {
        try
        {
            if (!IsAuthenticated())
                return Unauthorized("No authentication token provided.");
            return Ok(true);
        }
        catch (Exception ex)
        {
            _logger.LogError($"Failed while authenticating user: {ex.Message}", ex);
            return StatusCode(500, "Internal Server Error");
        }
    }

    private string HashPassword(string password)
    {
        // Convert password to byte array
        var passwordBytes = Encoding.UTF8.GetBytes(password);

        // Generate a random salt
        var salt = new byte[16];
        using (var rng = RandomNumberGenerator.Create())
        {
            rng.GetBytes(salt);
        }

        // Set Argon2 parameters
        var argon2 = new Argon2id(passwordBytes);
        argon2.Salt = salt;
        argon2.DegreeOfParallelism = 1; // Adjust based on your system's capabilities
        argon2.MemorySize = 4096; // Adjust for memory usage
        argon2.Iterations = 2; // Increase for stronger hashing

        // Generate hash
        var hashBytes = argon2.GetBytes(128); // 128 bytes (1024 bits)

        var saltBase64 = Convert.ToBase64String(salt);
        var hashBase64 = Convert.ToBase64String(hashBytes);
        return $"salt:{saltBase64}:hash:{hashBase64}";
    }

    private bool VerifyPassword(string password, string hash)
    {
        // Split stored hash to get salt
        var parts = hash.Split(':');
        var saltBase64 = parts[1];
        var storedHashBase64 = parts[3];

        // Convert password to byte array
        var passwordBytes = Encoding.UTF8.GetBytes(password);

        // Convert stored salt and hash back to byte arrays
        var salt = Convert.FromBase64String(saltBase64);
        var storedHashBytes = Convert.FromBase64String(storedHashBase64);

        // Set Argon2 parameters
        var argon2 = new Argon2id(passwordBytes);
        argon2.Salt = salt;
        argon2.DegreeOfParallelism = 1; // Ensure this matches hashing parameters
        argon2.MemorySize = 4096; // Ensure this matches hashing parameters
        argon2.Iterations = 2; // Ensure this matches hashing parameters

        // Generate check hash
        var checkHashBytes = argon2.GetBytes(128); // 128 bytes (1024 bits)

        // Compare generated check hash with stored hash
        return checkHashBytes.SequenceEqual(storedHashBytes);
    }

    private bool IsAuthenticated()
    {
        if (Request.Cookies.TryGetValue("authToken", out var token))
        {
            return _jwtService.IsAuthenticated(token);
        }
        else
        {
            return false;
        }
    }

    private string? GetCurrentUserId()
    {
        if (Request.Cookies.TryGetValue("authToken", out var token))
        {
            return _jwtService.GetUserIdFromToken(token);
        }
        else
        {
            return null;
        }
    }
}

public class AddUserRequest
{
    [Required]
    [EmailAddress]
    public string? Email { get; set; }

    [Required]
    public string? Password { get; set; }
}

public class UserResponse
{
    public string? Id { get; set; }
    public string? Email { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime UpdatedAt { get; set; }
}

public class UpdateUserRequest
{
    public string? Email { get; set; }
    public string? Password { get; set; }
}

public class LoginRequest
{
    [Required]
    [EmailAddress]
    public string Email { get; set; }

    [Required]
    public string Password { get; set; }
}