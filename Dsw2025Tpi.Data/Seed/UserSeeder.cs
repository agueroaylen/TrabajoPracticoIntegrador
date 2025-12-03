using Microsoft.AspNetCore.Identity;

namespace Dsw2025Tpi.Data.Seed;

public class UserSeeder
{
    private readonly UserManager<IdentityUser> _userManager;
    private readonly RoleManager<IdentityRole> _roleManager;

    public UserSeeder(UserManager<IdentityUser> userManager, RoleManager<IdentityRole> roleManager)
    {
        _userManager = userManager;
        _roleManager = roleManager;
    }

    public async Task SeedAsync()
    {
        string[] roles = { "admin", "customer" };

        foreach (var role in roles)
        {
            if (!await _roleManager.RoleExistsAsync(role))
                await _roleManager.CreateAsync(new IdentityRole(role));
        }

        await CreateUser("admin", "Admin123*", "admin");
        await CreateUser("customer", "Customer123*", "customer");
    }

    private async Task CreateUser(string username, string password, string role)
    {
        var user = await _userManager.FindByNameAsync(username);
        if (user == null)
        {
            user = new IdentityUser
            {
                UserName = username,
                EmailConfirmed = true
            };
            await _userManager.CreateAsync(user, password);
            await _userManager.AddToRoleAsync(user, role);
        }
    }
}

