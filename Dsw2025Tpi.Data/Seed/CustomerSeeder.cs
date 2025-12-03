using Dsw2025Tpi.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using System.Text.Json;

namespace Dsw2025Tpi.Data.Seed;

public static class CustomerSeeder
{
    public static async Task SeedCustomersAsync(this Dsw2025TpiContext context)
    {
      
        if (await context.Customers.AnyAsync())
            return;

        var filePath = Path.Combine(AppContext.BaseDirectory, "Sources", "customers.json");

        if (!File.Exists(filePath))
            throw new FileNotFoundException("No se encontró el archivo customers.json en: " + filePath);

        var json = await File.ReadAllTextAsync(filePath);

        var options = new JsonSerializerOptions
        {
            PropertyNameCaseInsensitive = true
        };

        var customers = JsonSerializer.Deserialize<List<Customer>>(json, options);

        if (customers == null || customers.Count == 0)
            throw new Exception("No se encontraron clientes en el archivo JSON.");

        await context.Customers.AddRangeAsync(customers);
        await context.SaveChangesAsync();
    }
}
