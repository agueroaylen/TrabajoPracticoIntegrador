using Dsw2025Tpi.Application.Constants;
using Dsw2025Tpi.Application.Dtos;
using Dsw2025Tpi.Application.Exceptions;
using Dsw2025Tpi.Application.Services.Interfaces;

namespace Dsw2025Tpi.Application.Services;

/// <summary>
/// Servicio de autenticación en memoria sin base de datos.
/// Usa usuarios hardcodeados para desarrollo/testing.
/// </summary>
public class InMemoryAuthService : IAuthService
{
    private readonly JwtTokenService _jwtTokenService;
    
    // Usuarios hardcodeados (mismos que UserSeeder)
    private readonly Dictionary<string, (string Password, string Role)> _users = new()
    {
        { "admin", ("Admin123*", "admin") },
        { "customer", ("Customer123*", "customer") }
    };

    public InMemoryAuthService(JwtTokenService jwtTokenService)
    {
        _jwtTokenService = jwtTokenService;
    }

    public Task<LoginResponse> LoginAsync(string username, string password)
    {
        // Buscar usuario
        if (!_users.TryGetValue(username, out var userData))
        {
            throw new AuthenticationException(ErrorMessages.InvalidCredentials);
        }

        // Verificar contraseña
        if (userData.Password != password)
        {
            throw new AuthenticationException(ErrorMessages.InvalidCredentials);
        }

        // Generar token y retornar con el rol
        var token = _jwtTokenService.GenerateToken(username, userData.Role);
        return Task.FromResult(new LoginResponse(token, userData.Role));
    }

    public Task<LoginResponse> RegisterAsync(string username, string email, string password, string role)
    {
        // Validar que el rol sea válido
        if (role != "admin" && role != "customer")
        {
            throw new BusinessException("El rol debe ser 'admin' o 'customer'");
        }

        // Verificar si el usuario ya existe
        if (_users.ContainsKey(username))
        {
            throw new BusinessException("El nombre de usuario ya está en uso");
        }

        // Agregar nuevo usuario a la lista en memoria
        _users[username] = (password, role);

        // Generar y retornar token con el rol
        var token = _jwtTokenService.GenerateToken(username, role);
        return Task.FromResult(new LoginResponse(token, role));
    }
}

