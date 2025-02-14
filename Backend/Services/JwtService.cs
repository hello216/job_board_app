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
                ValidateIssuer = false,
                ValidateAudience = false
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
            else
            {
                throw new InvalidOperationException("Failed to validate token as JwtSecurityToken.");
            }
        }
        catch (SecurityTokenInvalidLifetimeException)
        {
            throw new InvalidOperationException("Token has expired.");
        }
        catch (SecurityTokenInvalidSignatureException)
        {
            throw new InvalidOperationException("Token signature is invalid.");
        }
        catch (Exception ex)
        {
            throw new InvalidOperationException("Error validating token", ex);
        }
    }

    public bool IsAuthenticated(string token)
    {
        try
        {
            ValidateToken(token, out _);
            return true;
        }
        catch
        {
            return false;
        }
    }

    public ClaimsPrincipal GetPrincipalFromToken(string token)
    {
        try
        {
            var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(_secretKey));
            var handler = new JwtSecurityTokenHandler();

            return handler.ValidateToken(token, new TokenValidationParameters
            {
                ValidateIssuerSigningKey = true,
                IssuerSigningKey = key,
                ValidateLifetime = true,
                ValidateIssuer = false,
                ValidateAudience = false
            }, out _);
        }
        catch
        {
            return null;
        }
    }

    public string? GetUserIdFromToken(string? token)
    {
        if (string.IsNullOrEmpty(token))
            return null;

        try
        {
            var principal = GetPrincipalFromToken(token);
            if (principal != null)
            {
                return principal.Claims.FirstOrDefault(c => c.Type == "UserId")?.Value;
            }
            else
            {
                return null;
            }
        }
        catch
        {
            return null;
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