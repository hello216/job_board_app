using System;
using System.IO;
using System.Security.Cryptography;
using System.Text;

namespace Backend.Services;

public interface ICookieEncryptionService
{
    string Encrypt(string data);
    string Decrypt(string encryptedData);
}

public class CookieEncryptionService : ICookieEncryptionService
{
    private readonly byte[] _encryptionKey;

    public CookieEncryptionService(string encryptionKey)
    {
        var keyBytes = Convert.FromBase64String(encryptionKey); // Ensure key is base64 encoded
        using var sha256 = SHA256.Create();
        _encryptionKey = sha256.ComputeHash(keyBytes);
    }

    public string Encrypt(string data)
    {
        if (string.IsNullOrEmpty(data))
            return null;

        using var aes = Aes.Create();
        aes.Key = _encryptionKey;
        aes.GenerateIV();
        var iv = aes.IV;

        using var encryptor = aes.CreateEncryptor(aes.Key, aes.IV);
        using var ms = new MemoryStream();
        ms.Write(iv, 0, iv.Length);
        using var cs = new CryptoStream(ms, encryptor, CryptoStreamMode.Write);
        using var sw = new StreamWriter(cs);
        sw.Write(data);
        sw.Flush();
        cs.FlushFinalBlock();

        return Convert.ToBase64String(ms.ToArray());
    }

    public string Decrypt(string encryptedData)
    {
        if (string.IsNullOrEmpty(encryptedData))
            return null;

        var encryptedBytes = Convert.FromBase64String(encryptedData);
        using var aes = Aes.Create();
        aes.Key = _encryptionKey;
        var iv = new byte[16];
        Array.Copy(encryptedBytes, iv, 16);
        aes.IV = iv;

        using var encryptor = aes.CreateDecryptor(aes.Key, aes.IV);
        using var ms = new MemoryStream();
        ms.Write(encryptedBytes, 16, encryptedBytes.Length - 16);
        ms.Position = 0;
        using var cs = new CryptoStream(ms, encryptor, CryptoStreamMode.Read);
        using var sr = new StreamReader(cs);
        return sr.ReadToEnd();
    }
}