using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using Microsoft.IdentityModel.Tokens;
using Backend.Models;

namespace Backend.Services;

public class JwtService
{
    private readonly string _secretKey;

    public JwtService()
    {
        _secretKey = Environment.GetEnvironmentVariable("JWT_SECRET_KEY") ?? throw new InvalidOperationException("JWT secret key is missing.");
    }

    public string GenerateJwt(Users user)
    {
        try
        {
            var claims = new[] {
                new Claim(ClaimTypes.Name, user.Email),
                new Claim("UserId", user.Id.ToString())
            };

            var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(_secretKey));
            var creds = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

            var token = new JwtSecurityToken(
                claims: claims,
                expires: DateTime.UtcNow.AddHours(1),
                signingCredentials: creds);

            return new JwtSecurityTokenHandler().WriteToken(token);
        }
        catch (Exception ex)
        {
            throw new InvalidOperationException("Failed to generate JWT token", ex);
        }
    }

    public bool ValidateToken(string token, out string? newToken)
    {
        try
        {
            var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(_secretKey));
            var handler = new JwtSecurityTokenHandler();

            var principal = handler.ValidateToken(token, new TokenValidationParameters
            {
                ValidateIssuerSigningKey = true,
                IssuerSigningKey = key,
                ValidateLifetime = true,
            }, out var validatedToken);

            if (validatedToken is JwtSecurityToken jwtToken)
            {
                if (DateTime.UtcNow > jwtToken.ValidTo - TimeSpan.FromMinutes(30))
                {
                    newToken = GenerateJwtFromClaims(jwtToken.Claims);
                    return true;
                }
                else
                {
                    newToken = null;
                    return true;
                }
            }

            throw new InvalidOperationException("Token validation failed.");
        }
        catch (Exception ex)
        {
            newToken = null;
            throw new InvalidOperationException("Error validating token.", ex);
        }
    }

    private string GenerateJwtFromClaims(IEnumerable<Claim> claims)
    {
        try
        {
            var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(_secretKey));
            var creds = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

            var token = new JwtSecurityToken(
                claims: claims,
                expires: DateTime.UtcNow.AddHours(1),
                signingCredentials: creds);

            return new JwtSecurityTokenHandler().WriteToken(token);
        }
        catch (Exception ex)
        {
            throw new InvalidOperationException("Failed to generate JWT from claims.", ex);
        }
    }
}