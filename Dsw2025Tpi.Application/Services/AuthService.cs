using Dsw2025Tpi.Application.Constants;
using Dsw2025Tpi.Application.Dtos;
using Dsw2025Tpi.Application.Exceptions;
using Dsw2025Tpi.Application.Services.Interfaces;
using Microsoft.AspNetCore.Identity;
using System.Linq;
using Microsoft.Extensions.Logging;


namespace Dsw2025Tpi.Application.Services;

public class AuthService : IAuthService
{
    private readonly UserManager<IdentityUser> _userManager;
    private readonly SignInManager<IdentityUser> _signInManager;
    private readonly RoleManager<IdentityRole> _roleManager;
    private readonly JwtTokenService _jwtTokenService;
    private readonly ILogger<AuthService> _logger;

    public AuthService(
        UserManager<IdentityUser> userManager,
        SignInManager<IdentityUser> signInManager,
        RoleManager<IdentityRole> roleManager,
        JwtTokenService jwtTokenService,
        ILogger<AuthService> logger)
    {
        _userManager = userManager;
        _signInManager = signInManager;
        _roleManager = roleManager;
        _jwtTokenService = jwtTokenService;
        _logger = logger;
    }

    public async Task<LoginResponse> LoginAsync(string username, string password)
    {
        var user = await _userManager.FindByNameAsync(username);
        if (user == null)
            throw new AuthenticationException(ErrorMessages.InvalidCredentials);

        var result = await _signInManager.CheckPasswordSignInAsync(user, password, false);
        if (!result.Succeeded)
            throw new AuthenticationException(ErrorMessages.InvalidCredentials);

        var roles = await _userManager.GetRolesAsync(user);
        var role = roles.FirstOrDefault() ?? "customer";
        var token = _jwtTokenService.GenerateToken(user.UserName ?? username, role);
        return new LoginResponse(token, role);
    }

    public async Task<LoginResponse> RegisterAsync(string username, string email, string password, string role)
    {
        // Validar que el rol sea válido
        if (role != "admin" && role != "customer")
            throw new BusinessException("El rol debe ser 'admin' o 'customer'");

        // Verificar si el usuario ya existe
        var existingUser = await _userManager.FindByNameAsync(username);
        if (existingUser != null)
            throw new BusinessException("El nombre de usuario ya está en uso");

        // Verificar si el email ya existe
        var existingEmail = await _userManager.FindByEmailAsync(email);
        if (existingEmail != null)
            throw new BusinessException("El email ya está en uso");

        // Crear nuevo usuario
        var user = new IdentityUser
        {
            UserName = username,
            Email = email,
            EmailConfirmed = true
        };

        var result = await _userManager.CreateAsync(user, password);
        if (!result.Succeeded)
        {
            var errors = string.Join(", ", result.Errors.Select(e => e.Description));
            throw new BusinessException($"Error al crear el usuario: {errors}");
        }

        // Asegurar que el rol existe antes de asignarlo
        if (!await _roleManager.RoleExistsAsync(role))
        {
            _logger.LogWarning("El rol '{Role}' no existe. Creándolo...", role);
            await _roleManager.CreateAsync(new IdentityRole(role));
        }

        // Asignar rol al usuario
        var roleResult = await _userManager.AddToRoleAsync(user, role);
        if (!roleResult.Succeeded)
        {
            var roleErrors = string.Join(", ", roleResult.Errors.Select(e => e.Description));
            _logger.LogError("Error al asignar rol '{Role}' al usuario '{Username}': {Errors}", role, username, roleErrors);
            // No lanzar excepción, el usuario ya fue creado
        }

        // Generar y retornar token con el rol
        var token = _jwtTokenService.GenerateToken(user.UserName, role);
        return new LoginResponse(token, role);
    }
}

