using Microsoft.AspNetCore.Mvc;
using Backend.Models;
using System.Text;
using Konscious.Security.Cryptography;

namespace Backend.Controllers;

[Route("api/[controller]")]
[ApiController]
public class UserController : ControllerBase
{
    private readonly AppDbContext _context;

    public UserController(AppDbContext context)
    {
        _context = context;
    }

    // POST: api/User
    [HttpPost]
    public async Task<ActionResult<Users>> Create(AddUserRequest request)
    {
        if (_context.Users.Any(u => u.Email == request.Email))
            return BadRequest("Email is already in use.");

        var user = new Users
        {
            Email = request.Email,
            PasswordHash = HashPassword(request.Password)
        };

        _context.Users.Add(user);
        await _context.SaveChangesAsync();
        return CreatedAtAction(nameof(Create), new { id = user.Id }, user);
    }

    private string HashPassword(string password)
    {
        var argon2 = new Argon2id();
        var hash = argon2.Hash(password);
        return hash;
    }

    private bool VerifyPassword(string password, string hash)
    {
        var argon2 = new Argon2id();
        return argon2.Verify(hash, password);
    }
}

public class AddUserRequest
{
    [Required]
    [EmailAddress]
    public string Email { get; set; }

    [Required]
    public string Password { get; set; }
}