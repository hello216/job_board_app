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
using iText.Kernel.Pdf;

namespace Backend.Controllers;

[Route("api/[controller]")]
[ApiController]
public class FilesController : ControllerBase
{
    private readonly AppDbContext _context;
    private readonly JwtService _jwtService;
    private readonly ILogger<FilesController> _logger;
    private readonly ICookieEncryptionService _cookieEncryptionService;
    private readonly InputSanitizerService _sanitizerService;
    private readonly string _filesFolder;

    private const long FILE_SIZE_LIMIT = 5 * 1024 * 1024; // 5 MB
    private long FileSizeLimitInMB => FILE_SIZE_LIMIT / (1024 * 1024);

    public FilesController(AppDbContext context, JwtService jwtService, ILogger<FilesController> logger,
        ICookieEncryptionService cookieEncryptionService, IWebHostEnvironment env, InputSanitizerService sanitizerService)
    {
        _context = context;
        _jwtService = jwtService;
        _logger = logger;
        _cookieEncryptionService = cookieEncryptionService;
        _sanitizerService = sanitizerService;
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

            var sanitizedFileName = _sanitizerService.Sanitize(file.FileName);

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

            await RemovePdfMetadata(filePath);
            var hash = HashFile(filePath);

            var dbFile = new Files
            {
                UserId = user.Id,
                User = user,
                Name = sanitizedFileName,
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

        int bytesRead = await stream.ReadAsync(magicNumberBytes);

        if (bytesRead != magicNumberBytes.Length)
        {
            // Handle the case where fewer than 5 bytes were read
            throw new EndOfStreamException("Could not read enough bytes for magic number.");
        }

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

    private Task RemovePdfMetadata(string filePath)
    {
        try
        {
            using var reader = new PdfReader(filePath);
            using var writer = new PdfWriter(filePath);

            var pdf = new PdfDocument(reader, writer);
            var docInfo = pdf.GetDocumentInfo();

            // Reset metadata properties
            docInfo.SetAuthor("");
            docInfo.SetCreator("");
            docInfo.SetKeywords("");
            docInfo.SetProducer("");
            docInfo.SetSubject("");
            docInfo.SetTitle("");

            pdf.Close();
        }
        catch (Exception ex)
        {
            Console.WriteLine($"Failed to remove PDF metadata: {ex.Message}");
        }

        return Task.CompletedTask;
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