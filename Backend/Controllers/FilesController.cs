using System.ComponentModel.DataAnnotations;
using Microsoft.AspNetCore.Mvc;
using Backend.Models;
using Backend.Data;
using Backend.Services;
using Microsoft.Extensions.Logging;
using Microsoft.EntityFrameworkCore;
using System.IO;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.RateLimiting;
using System.Text;

namespace Backend.Controllers;

[Route("api/[controller]")]
[ApiController]
public class FilesController : ControllerBase
{
    private readonly AppDbContext _context;
    private readonly JwtService _jwtService;
    private readonly ILogger<FilesController> _logger;
    private readonly ICookieEncryptionService _cookieEncryptionService;
    private readonly string _filesFolder;

    private const long FILE_SIZE_LIMIT = 5 * 1024 * 1024; // 5 MB
    private long FileSizeLimitInMB => FILE_SIZE_LIMIT / (1024 * 1024);

    public FilesController(AppDbContext context, JwtService jwtService, ILogger<FilesController> logger,
        ICookieEncryptionService cookieEncryptionService, IWebHostEnvironment env)
    {
        _context = context;
        _jwtService = jwtService;
        _logger = logger;
        _cookieEncryptionService = cookieEncryptionService;
        _filesFolder = Path.Combine(env.ContentRootPath, "files");
    }

    [EnableRateLimiting("FileUploadLimit")]
    [HttpPost]
    public async Task<ActionResult> UploadFile(IFormFile file, string fileType)
    {
        if (!IsAuthenticated())
            return Unauthorized("No authentication token provided.");

        try
        {
            var currentUserId = GetCurrentUserId();
            if (currentUserId == null)
            {
                return Unauthorized("No authentication token provided.");
            }

            if (file == null)
            {
                return BadRequest("No file provided");
            }

            var sanitizedName = file.FileName.Trim()
                .Replace("<", "").Replace(">", "")
                .Replace("\\", "").Replace("/", "")
                .Replace("?", "").Replace("*", "")
                .Replace("|", "");

            // Validate file type
            FileType fileTypeEnum = FileType.Resume;
            if (fileType != null && !Enum.TryParse(fileType, true, out fileTypeEnum))
            {
                return BadRequest("Invalid file type provided.");
            }

            if (!(await IsValidPdf(file)))
            {
                return BadRequest("Only PDF files are allowed.");
            }

            // Check file size
            if (file.Length <= 0 || file.Length > FILE_SIZE_LIMIT)
            {
                return BadRequest($"File size exceeds the limit ({FileSizeLimitInMB} MB).");
            }

            var user = await _context.Users.FindAsync(currentUserId);
            if (user == null)
            {
                return NotFound("User not found.");
            }

            var randomizedName = Guid.NewGuid().ToString() + ".pdf";
            var filePath = Path.Combine(_filesFolder, randomizedName);

            // Save file to disk
            using var stream = new FileStream(filePath, FileMode.Create);
            await file.CopyToAsync(stream);

            var hash = HashFile(filePath);

            var dbFile = new Files
            {
                UserId = user.Id,
                User = user,
                Name = sanitizedName,
                Hash = hash,
                SizeInBytes = file.Length,
                FileType = fileTypeEnum
            };

            _context.Files.Add(dbFile);
            await _context.SaveChangesAsync();

            return Ok(new { message = "File uploaded successfully." });
        }
        catch (Exception ex)
        {
            _logger.LogError($"Failed to upload file: {ex.Message} {ex.StackTrace}", ex.InnerException ?? ex);
            return StatusCode(500, "Internal Server Error");
        }
    }

    private async Task<byte[]> ReadMagicNumber(IFormFile file)
    {
        using var stream = file.OpenReadStream();
        var magicNumberBytes = new byte[5]; // First 5 bytes of the file(magic number)
        await stream.ReadAsync(magicNumberBytes);
        return magicNumberBytes;
    }

    private async Task<bool> IsValidPdf(IFormFile file)
    {
        var magicNumberBytes = await ReadMagicNumber(file);
        return Encoding.UTF8.GetString(magicNumberBytes) == "%PDF-";
    }

    private string HashFile(string filePath)
    {
        using var stream = System.IO.File.OpenRead(filePath);
        using var sha256 = System.Security.Cryptography.SHA256.Create();
        var hashBytes = sha256.ComputeHash(stream);
        return BitConverter.ToString(hashBytes).Replace("-", "").ToLower();
    }

    private bool IsAuthenticated()
    {
        if (Request.Cookies.TryGetValue("authToken", out var encryptedToken))
        {
            var token = _cookieEncryptionService.Decrypt(encryptedToken);
            // Checking for null ensures the method doesn't throw when decrypting fails or token is missing.
            return token != null && _jwtService.IsAuthenticated(token);
        }
        else
        {
            return false;
        }
    }

    private string? GetCurrentUserId()
    {
        if (Request.Cookies.TryGetValue("authToken", out var encryptedToken))
        {
            var token = _cookieEncryptionService.Decrypt(encryptedToken);
            // Checking for null ensures the method doesn't throw when decrypting fails or token is missing.
            return token != null ? _jwtService.GetUserIdFromToken(token) : null;
        }
        else
        {
            return null;
        }
    }
}