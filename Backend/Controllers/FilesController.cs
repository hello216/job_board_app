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
using System.Security.Cryptography;
using System.Text.Json;
using DotNetEnv;

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
    private string EncryptionKey => Environment.GetEnvironmentVariable("ENCRYPTION_KEY");

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
    [HttpPost("upload")]
    public async Task<ActionResult> UploadFile(IFormFile file)
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

            // Read fileType from form data
            var fileType = Request.Form["fileType"];

            if (string.IsNullOrEmpty(fileType))
            {
                return BadRequest("The fileType field is required.");
            }

            var sanitizedFileName = _sanitizerService.Sanitize(file.FileName);

            // Validate file type
            FileType fileTypeEnum = FileType.Resume;
            if (!Enum.TryParse(fileType, true, out fileTypeEnum))
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

            if (!Directory.Exists(_filesFolder))
            {
                Directory.CreateDirectory(_filesFolder);
            }

            using var stream = new FileStream(filePath, FileMode.Create);
            await file.CopyToAsync(stream);

            await RemovePdfMetadata(filePath);
            await EncryptFileAsync(filePath);
            var hash = HashFile(filePath + ".enc");

            var dbFile = new Files
            {
                UserId = user.Id,
                User = user,
                Name = sanitizedFileName,
                Hash = hash,
                SizeInBytes = new FileInfo(filePath + ".enc").Length,
                FileType = fileTypeEnum
            };

            _context.Files.Add(dbFile);
            await _context.SaveChangesAsync();

            return Ok(new { message = "File uploaded successfully." });
        }
        catch (Exception ex)
        {
            _logger.LogError($"Failed to upload file: {ex.Message}", ex);
            return StatusCode(500, "Internal Server Error");
        }
    }

    [HttpGet("{id}")]
    public async Task<ActionResult> GetFile(int id)
    {
        if (!IsAuthenticated())
            return Unauthorized("No authentication token provided.");

        Files fileRecord = null;
        try
        {
            var currentUserId = GetCurrentUserId();
            if (currentUserId == null)
            {
                return Unauthorized("No authentication token provided.");
            }

            fileRecord = await _context.Files.FindAsync(id);

            if (fileRecord == null)
                return NotFound("File not found.");

            if (fileRecord.UserId != currentUserId)
                return Unauthorized("You do not own this file.");

            var encryptedFilePath = Path.Combine(_filesFolder, fileRecord.Name + ".enc");
            await DecryptFileAsync(encryptedFilePath);

            // Read and return the decrypted file
            var decryptedFilePath = encryptedFilePath + ".dec";
            var bytes = await System.IO.File.ReadAllBytesAsync(decryptedFilePath);

            return File(bytes, "application/pdf", fileRecord.Name);
        }
        catch (Exception ex)
        {
            _logger.LogError($"Failed to retrieve file: {ex.Message}", ex);
            return StatusCode(500, "Internal Server Error");
        }
        finally
        {
            // Securely delete the decrypted file after sending it
            if (fileRecord != null)
            {
                var encryptedFilePath = Path.Combine(_filesFolder, fileRecord.Name + ".enc");
                var decryptedFilePath = encryptedFilePath + ".dec";
                if (System.IO.File.Exists(decryptedFilePath))
                {
                    System.IO.File.Delete(decryptedFilePath);
                }
            }
        }
    }

    [HttpGet("all")]
    public async Task<ActionResult<IEnumerable<FilesModel>>> GetAllFilesForUser()
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

            var files = await _context.Files
                .Where(f => f.UserId == currentUserId)
                .ToListAsync();

            if (files == null)
                return NotFound("No files found for this user.");

            var filesModel = files.Select(file => new FilesModel
            {
                Id = file.Id,
                Name = file.Name,
                FileType = file.FileType.ToString(),
            }).ToList();

            return Ok(filesModel);
        }
        catch (Exception ex)
        {
            _logger.LogError($"Failed to fetch files for user: {ex.Message}", ex);
            return StatusCode(500, "Internal Server Error");
        }
    }

    [HttpDelete("{id}")]
    public async Task<ActionResult> DeleteFile(int id)
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

            var fileRecord = await _context.Files.FindAsync(id);

            if (fileRecord == null)
                return NotFound("File not found.");

            if (fileRecord.UserId != currentUserId)
                return Unauthorized("You do not own this file.");

            var encryptedFilePath = Path.Combine(_filesFolder, fileRecord.Name + ".enc");

            // Delete the file
            if (System.IO.File.Exists(encryptedFilePath))
            {
                System.IO.File.Delete(encryptedFilePath);
            }

            _context.Files.Remove(fileRecord);
            await _context.SaveChangesAsync();

            return Ok(new { message = "File deleted successfully." });
        }
        catch (Exception ex)
        {
            _logger.LogError($"Failed to delete file: {ex.Message}", ex);
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

    private async Task EncryptFileAsync(string filePath)
    {
        try
        {
            if (string.IsNullOrEmpty(EncryptionKey))
            {
                throw new Exception("Encryption key is missing.");
            }

            var key = Convert.FromBase64String(EncryptionKey);
            if (key.Length != 32) // AES-256 requires 256-bit key
            {
                throw new ArgumentException("Invalid key size. Expected AES-256 key (32 bytes).");
            }

            using var aes = Aes.Create();
            aes.Key = key;
            aes.GenerateIV();

            var iv = aes.IV;
            using var ms = new MemoryStream();
            ms.Write(iv, 0, iv.Length);

            using (var cs = new CryptoStream(ms, aes.CreateEncryptor(), CryptoStreamMode.Write))
            {
                using var fileStream = new FileStream(filePath, FileMode.Open, FileAccess.Read, FileShare.Read);
                await fileStream.CopyToAsync(cs);
                cs.FlushFinalBlock();
            }

            ms.Position = 0;

            // Save encrypted data
            using var fileStreamOutput = new FileStream(filePath + ".enc", FileMode.Create);
            await ms.CopyToAsync(fileStreamOutput);
            fileStreamOutput.Close();

            // Securely delete the original file after encryption
            System.IO.File.Delete(filePath);
        }
        catch (Exception ex)
        {
            _logger.LogError($"Failed to encrypt file: {ex.Message} {ex.StackTrace}", ex);
            throw;
        }
    }

    private async Task DecryptFileAsync(string encryptedFilePath)
    {
        try
        {
            if (string.IsNullOrEmpty(EncryptionKey))
            {
                throw new Exception("Encryption key is missing.");
            }

            var key = Convert.FromBase64String(EncryptionKey);
            if (key.Length != 32) // AES-256 requires 256-bit key
            {
                throw new ArgumentException("Invalid key size. Expected AES-256 key (32 bytes).");
            }

            using var aes = Aes.Create();
            aes.Key = key;

            using var ms = new MemoryStream();
            using var fileStream = new FileStream(encryptedFilePath, FileMode.Open);
            await fileStream.CopyToAsync(ms);
            ms.Position = 0;

            var iv = new byte[16]; // AES IV is 16 bytes
            ms.Read(iv, 0, iv.Length);
            aes.IV = iv;

            using var cs = new CryptoStream(ms, aes.CreateDecryptor(), CryptoStreamMode.Read);
            using var decryptedStream = new FileStream(encryptedFilePath + ".dec", FileMode.Create);

            await cs.CopyToAsync(decryptedStream);
        }
        catch (Exception ex)
        {
            _logger.LogError($"Failed to decrypt file: {ex.Message} {ex.StackTrace}", ex);
            throw;
        }
    }
}

public class FilesModel
{
    public string Id { get; set; }
    public string Name { get; set; }
    public string FileType { get; set; }
}