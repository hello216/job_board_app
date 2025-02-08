using Microsoft.AspNetCore.Http;
using Backend.Services;
using System.Threading.Tasks;

namespace Backend.Middleware;

public class JwtCookieValidationMiddleware
{
    private readonly RequestDelegate _next;
    private readonly JwtService _jwtService;

    public JwtCookieValidationMiddleware(RequestDelegate next, JwtService jwtService)
    {
        _next = next;
        _jwtService = jwtService;
    }

    public async Task InvokeAsync(HttpContext context)
    {
        if (context.Request.Cookies.TryGetValue("authToken", out var token))
        {
            string? newToken;
            var isValid = _jwtService.ValidateToken(token, out newToken);

            if (!isValid)
            {
                context.Response.StatusCode = StatusCodes.Status401Unauthorized;
                await context.Response.WriteAsync("Unauthorized");
                return;
            }

            if (newToken != null)
            {
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
            context.Response.StatusCode = StatusCodes.Status401Unauthorized;
            await context.Response.WriteAsync("Unauthorized");
            return;
        }

        await _next(context);
    }
}