using Dsw2025Tpi.Application.Dtos;
using Dsw2025Tpi.Application.Services.Interfaces;
using Dsw2025Tpi.Application.Exceptions;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Dsw2025Tpi.Data;
using Dsw2025Tpi.Domain.Entities;

namespace Dsw2025Tpi.Api.Controllers;

[ApiController]
[Route("api")]
public class AuthController : ControllerBase
{
    private readonly IAuthService _authService;
    private readonly ILogger<AuthController> _logger;
    private readonly Dsw2025TpiContext _context;

    public AuthController(IAuthService authService, ILogger<AuthController> logger, Dsw2025TpiContext context)
    {
        _authService = authService;
        _logger = logger;
        _context = context;
    }

    [HttpPost("login")]
    public async Task<IActionResult> Login([FromBody] LoginModel request)
    {
        try
        {
            if (request == null || string.IsNullOrWhiteSpace(request.Username) || string.IsNullOrWhiteSpace(request.Password))
            {
                return BadRequest(new { error = "Usuario y contraseña son requeridos." });
            }

            _logger.LogInformation("Intento de login para usuario: {Username}", request.Username);
            var result = await _authService.LoginAsync(request.Username, request.Password);
            return Ok(new { token = result.Token, role = result.Role });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error al intentar login para usuario: {Username}", request?.Username);
            throw; // Re-lanzar para que el middleware lo maneje
        }
    }

    [HttpPost("register")]
    public async Task<IActionResult> Register([FromBody] RegisterModel request)
    {
        try
        {
            if (request == null || string.IsNullOrWhiteSpace(request.Username) || string.IsNullOrWhiteSpace(request.Email) || string.IsNullOrWhiteSpace(request.Password))
            {
                return BadRequest(new { error = "Todos los campos son requeridos." });
            }

            _logger.LogInformation("Intento de registro para usuario: {Username}", request.Username);
            var result = await _authService.RegisterAsync(request.Username, request.Email, request.Password, request.Role);
            
            // Si el rol es "customer", crear el Customer entity en la base de datos
            if (result.Role.ToLower() == "customer")
            {
                try
                {
                    // Verificar si el customer ya existe
                    var existingCustomer = await _context.Customers
                        .FirstOrDefaultAsync(c => c.Name == request.Username);
                    
                    if (existingCustomer == null)
                    {
                        // Crear nuevo customer
                        var customer = new Customer
                        {
                            Id = Guid.NewGuid(),
                            Name = request.Username,
                            EMail = request.Email,
                            PhoneNumber = string.Empty // Usar string vacío en lugar de null para SQLite
                        };
                        
                        _context.Customers.Add(customer);
                        await _context.SaveChangesAsync();
                        _logger.LogInformation("Customer creado para usuario: {Username}", request.Username);
                    }
                }
                catch (Exception dbEx)
                {
                    // Si hay un error con la base de datos, solo loguear pero no fallar el registro
                    _logger.LogWarning(dbEx, "No se pudo crear el Customer en la base de datos para usuario: {Username}. El usuario fue registrado correctamente.", request.Username);
                }
            }
            
            return Ok(new { token = result.Token, role = result.Role });
        }
        catch (BusinessException bex)
        {
            _logger.LogWarning(bex, "Error de negocio al registrar usuario: {Username}", request?.Username);
            return BadRequest(new { error = bex.Message });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error al intentar registro para usuario: {Username}. Error completo: {Error}", request?.Username, ex.ToString());
            
            // Retornar un error 500 con detalles para debugging
            return StatusCode(500, new { 
                error = $"Error al registrar usuario: {ex.Message}", 
                details = ex.ToString(),
                innerException = ex.InnerException?.Message 
            });
        }
    }
}
