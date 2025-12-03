using Dsw2025Tpi.Application.Dtos;

namespace Dsw2025Tpi.Application.Services.Interfaces;

public interface IAuthService
{
    Task<LoginResponse> LoginAsync(string username, string password);
    Task<LoginResponse> RegisterAsync(string username, string email, string password, string role);
}

