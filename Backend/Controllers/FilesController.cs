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
using iText.Kernel.Pdf;
using iText.Kernel.XMP;
using System.Diagnostics;
using System.IO.Compression;

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

        string filePath = null;
        string zipPath = null;

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

            var randomizedName = Guid.NewGuid().ToString();
            filePath = Path.Combine(_filesFolder, randomizedName + ".pdf");
            zipPath = Path.Combine(_filesFolder, randomizedName + ".zip");

            if (!Directory.Exists(_filesFolder))
            {
                Directory.CreateDirectory(_filesFolder);
            }

            // Save uploaded file
            using (var stream = new FileStream(filePath, FileMode.Create))
            {
                await file.CopyToAsync(stream);
            }

            // Zip the file
            using (var zipArchive = ZipFile.Open(zipPath, ZipArchiveMode.Create))
            {
                zipArchive.CreateEntryFromFile(filePath, sanitizedFileName);
            }

            try
            {
                await RemovePdfMetadata(filePath); // Still clean metadata from original PDF before zipping
            }
            catch (Exception ex)
            {
                _logger.LogWarning($"Failed to remove PDF metadata, but continuing with upload: {ex.Message}");
            }

            await EncryptFileAsync(zipPath); // Encrypt the zip
            var hash = HashFile(zipPath + ".enc");

            var dbFile = new Files
            {
                UserId = user.Id,
                User = user,
                Name = randomizedName + ".zip",
                Hash = hash,
                SizeInBytes = new FileInfo(zipPath + ".enc").Length,
                FileType = fileTypeEnum
            };

            _context.Files.Add(dbFile);
            await _context.SaveChangesAsync();

            // Clean up temporary and unencrypted files
            if (System.IO.File.Exists(filePath))
                System.IO.File.Delete(filePath);
            if (System.IO.File.Exists(zipPath))
                System.IO.File.Delete(zipPath);
            if (System.IO.File.Exists(filePath + ".temp"))
                System.IO.File.Delete(filePath + ".temp");

            return Ok(new { message = "File uploaded successfully.", fileId = dbFile.Id });
        }
        catch (Exception ex)
        {
            if (ex is InvalidOperationException)
            {
                _logger.LogError($"File upload failed due to scanning issues: {ex.Message}");
                if (System.IO.File.Exists(filePath))
                {
                    System.IO.File.Delete(filePath);
                }
                return BadRequest($"File upload failed. {ex.Message}");
            }
            else
            {
                _logger.LogError($"Failed to upload file: {ex.Message}", ex);
                // Cleanup in case of failure
                if (System.IO.File.Exists(filePath))
                    System.IO.File.Delete(filePath);
                if (System.IO.File.Exists(zipPath))
                    System.IO.File.Delete(zipPath);
                return StatusCode(500, "Internal Server Error");
            }
        }
    }

    [HttpGet("{id}")]
    public async Task<ActionResult> GetFile(string id)
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
            if (!System.IO.File.Exists(encryptedFilePath))
                return NotFound("Encrypted file missing on server.");

            // Decrypt the encrypted zip
            await DecryptFileAsync(encryptedFilePath);
            var decryptedZipPath = encryptedFilePath + ".dec"; // This is the .zip file

            // Read and return the decrypted zip
            var bytes = await System.IO.File.ReadAllBytesAsync(decryptedZipPath);

            // Compare the file hash with the stored hash (of the encrypted file)
            string encryptedFileHash = HashFile(encryptedFilePath);
            if (fileRecord.Hash != encryptedFileHash)
            {
                _logger.LogWarning($"Hash mismatch for file {id}. Stored hash: {fileRecord.Hash}, Decrypted hash: {encryptedFileHash}");
                return StatusCode(500, "File integrity check failed: hash mismatch.");
            }

            return File(bytes, "application/zip", fileRecord.Name);
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

    [HttpPut("link/{fileId}")]
    public async Task<IActionResult> LinkFileToJob(string fileId, [FromBody] LinkFileRequest request)
    {
        if (request == null || string.IsNullOrEmpty(request.JobId))
        {
            return BadRequest("Job ID is required.");
        }

        try
        {
            var currentUserId = GetCurrentUserId();
            if (currentUserId == null)
            {
                return Unauthorized("No authentication token provided.");
            }

            var file = await _context.Files
                .Include(f => f.Jobs)
                .FirstOrDefaultAsync(f => f.Id == fileId);

            if (file == null)
            {
                return NotFound("File not found.");
            }

            var job = await _context.Jobs.FindAsync(request.JobId);
            if (job == null)
            {
                return NotFound("Job application not found.");
            }

            if (file.UserId != currentUserId)
            {
                return Unauthorized("You do not have permission to access this file.");
            }

            if (job.UserId != currentUserId)
            {
                return Unauthorized("You do not have permission to access this job application.");
            }

            // Add the job to the file's Jobs list if not already linked
            if (!file.Jobs.Any(j => j.Id == request.JobId))
            {
                file.Jobs.Add(job);
                file.UpdateTimestamps();
                _context.Files.Update(file);
                await _context.SaveChangesAsync();
            }

            return Ok(new { message = "File successfully linked to job application." });
        }
        catch (Exception ex)
        {
            _logger.LogError($"Failed to link file to job: {ex.Message}", ex);
            return StatusCode(500, "Internal Server Error");
        }
    }

    [HttpPut("unlink/{fileId}")]
    public async Task<IActionResult> RemoveFileFromJob(string fileId, [FromBody] LinkFileRequest request)
    {
        if (request == null || string.IsNullOrEmpty(request.JobId))
        {
            return BadRequest("Job ID is required.");
        }

        try
        {
            var currentUserId = GetCurrentUserId();
            if (currentUserId == null)
            {
                return Unauthorized("No authentication token provided.");
            }

            var file = await _context.Files
                .Include(f => f.Jobs)
                .FirstOrDefaultAsync(f => f.Id == fileId);

            if (file == null)
            {
                return NotFound("File not found.");
            }

            var job = await _context.Jobs.FindAsync(request.JobId);
            if (job == null)
            {
                return NotFound("Job application not found.");
            }

            if (file.UserId != currentUserId)
            {
                return Unauthorized("You do not have permission to access this file.");
            }

            if (job.UserId != currentUserId)
            {
                return Unauthorized("You do not have permission to access this job application.");
            }

            // Check if the link exists before attempting to remove
            var existingJob = file.Jobs.FirstOrDefault(j => j.Id == request.JobId);
            if (existingJob == null)
            {
                return BadRequest("This file is not linked to the specified job application.");
            }

            file.Jobs.Remove(existingJob);
            file.UpdateTimestamps();
            _context.Files.Update(file);
            await _context.SaveChangesAsync();

            return Ok(new { message = "File successfully unlinked from job application." });
        }
        catch (Exception ex)
        {
            _logger.LogError($"Failed to unlink file from job: {ex.Message}", ex);
            return StatusCode(500, "Internal Server Error");
        }
    }

    [HttpDelete("{id}")]
    public async Task<ActionResult> DeleteFile(string id)
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

    private async Task RemovePdfMetadata(string filePath)
    {
        try
        {
            using var reader = new PdfReader(filePath);
            using var writer = new PdfWriter(filePath + ".temp");
            using var pdf = new PdfDocument(reader, writer);

            var info = pdf.GetDocumentInfo();
            if (info != null)
            {
                info.SetAuthor("");
                info.SetCreator("");
                info.SetKeywords("");
                info.SetProducer("");
                info.SetSubject("");
                info.SetTitle("");
            }

            // Remove metadata stream if it exists
            if (pdf.GetCatalog().GetPdfObject().ContainsKey(PdfName.Metadata))
            {
                pdf.GetCatalog().GetPdfObject().Remove(PdfName.Metadata);
            }

            // Remove XMP metadata if it exists
            if (pdf.GetXmpMetadata() != null)
            {
                pdf.SetXmpMetadata(null);
            }

            pdf.Close();

            // Replace the original file with the cleaned version
            System.IO.File.Delete(filePath);
            System.IO.File.Move(filePath + ".temp", filePath);

            _logger.LogInformation("PDF metadata removal attempt completed.");
        }
        catch (Exception ex)
        {
            _logger.LogError($"Failed to remove PDF metadata: {ex.Message}", ex);
            throw; // Re-throw the exception to be caught in the calling method
        }
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

    public async Task EncryptFileAsync(string filePath)
    {
        var encryptionKey = Convert.FromBase64String(Environment.GetEnvironmentVariable("ENCRYPTION_KEY"));
        using var aes = Aes.Create();
        aes.Key = encryptionKey;
        aes.GenerateIV(); // Generate a new IV for each encryption

        using var fileStream = new FileStream(filePath, FileMode.Open);
        using var outputStream = new FileStream(filePath + ".enc", FileMode.Create);

        // Write IV at the beginning of the file
        await outputStream.WriteAsync(aes.IV, 0, aes.IV.Length);

        using var cryptoStream = new CryptoStream(outputStream, aes.CreateEncryptor(), CryptoStreamMode.Write);
        await fileStream.CopyToAsync(cryptoStream);
        // Ensure the cryptoStream is flushed before it closes
        cryptoStream.FlushFinalBlock();
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
            if (key.Length != 32)
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
            if (ms.Read(iv, 0, iv.Length) != iv.Length)
            {
                throw new Exception("Could not read IV from encrypted file.");
            }
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

public class LinkFileRequest
{
    public string JobId { get; set; }
}