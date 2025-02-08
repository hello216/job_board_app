using Microsoft.AspNetCore.Http;
using Backend.Services;
using Microsoft.Extensions.Logging;
using System.Threading.Tasks;

namespace Backend.Middleware;

public class JwtCookieValidationMiddleware
{
    private readonly RequestDelegate _next;
    private readonly JwtService _jwtService;
    private readonly ILogger<JwtCookieValidationMiddleware> _logger;

    public JwtCookieValidationMiddleware(RequestDelegate next, JwtService jwtService, ILogger<JwtCookieValidationMiddleware> logger)
    {
        _next = next;
        _jwtService = jwtService;
        _logger = logger;
    }

    public async Task InvokeAsync(HttpContext context)
    {
        try
        {
            if (context.Request.Cookies.TryGetValue("authToken", out var token))
            {
                _logger.LogInformation("Found token in cookie.");

                string? newToken;
                var isValid = _jwtService.ValidateToken(token, out newToken);

                _logger.LogInformation($"Token is valid: {isValid}");

                if (!isValid)
                {
                    _logger.LogInformation("Rejecting request due to invalid token.");
                    context.Response.StatusCode = StatusCodes.Status401Unauthorized;
                    await context.Response.WriteAsync("Unauthorized");
                    return;
                }

                if (newToken != null)
                {
                    _logger.LogInformation("Updating token in cookie.");
                    context.Response.Cookies.Append("authToken", newToken, new CookieOptions
                    {
                        HttpOnly = true,
                        SameSite = SameSiteMode.None,
                        Secure = true,
                    });
                }
            }
            else
            {
                _logger.LogInformation("No token found in cookie. Rejecting request.");
                context.Response.StatusCode = StatusCodes.Status401Unauthorized;
                await context.Response.WriteAsync("Unauthorized");
                return;
            }

            await _next(context);
        }
        catch (Exception ex)
        {
            _logger.LogError($"Error in JwtCookieValidationMiddleware: {ex.Message}", ex);
            context.Response.StatusCode = StatusCodes.Status500InternalServerError;
            await context.Response.WriteAsync("Internal Server Error");
        }
    }
}