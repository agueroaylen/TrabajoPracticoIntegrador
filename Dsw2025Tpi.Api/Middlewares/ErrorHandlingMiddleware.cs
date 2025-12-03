using Dsw2025Tpi.Application.Exceptions;
using System.Net;
using System.Text.Json;
using Microsoft.Extensions.Hosting;

namespace Dsw2025Tpi.Api.Middlewares;

public class ErrorHandlingMiddleware
{
    private readonly RequestDelegate _next;

    public ErrorHandlingMiddleware(RequestDelegate next)
    {
        _next = next;
    }

    public async Task InvokeAsync(HttpContext context)
    {
        try
        {
            await _next(context); // Continuar con el pipeline
        }
        catch (Exception ex)
        {
            await HandleExceptionAsync(context, ex);
        }
    }

    private static Task HandleExceptionAsync(HttpContext context, Exception ex)
    {
        HttpStatusCode status;
        string message;

        switch (ex)
        {
            case BusinessException:
                status = HttpStatusCode.BadRequest; //400
                message = ex.Message;
                break;

            case AuthenticationException:
                status = HttpStatusCode.Unauthorized; // 401
                message = ex.Message;
                break;

            case AuthorizationException:
                status = HttpStatusCode.Forbidden; // 403
                message = ex.Message;
                break;

            case KeyNotFoundException:
                status = HttpStatusCode.NotFound; // 404
                message = ex.Message;
                break;

            default:
                status = HttpStatusCode.InternalServerError; //500
                message = $"Ocurrió un error inesperado: {ex.Message}";
                // En desarrollo, incluir más detalles
                if (context.RequestServices.GetService<IHostEnvironment>()?.IsDevelopment() == true)
                {
                    message += $" | StackTrace: {ex.StackTrace}";
                }
                break;
        }

        var result = JsonSerializer.Serialize(new { error = message });
        context.Response.ContentType = "application/json";
        context.Response.StatusCode = (int)status;
        return context.Response.WriteAsync(result);
    }
}

