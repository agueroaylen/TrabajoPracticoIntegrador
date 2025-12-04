using Dsw2025Tpi.Domain.Entities;
using Microsoft.EntityFrameworkCore;

namespace Dsw2025Tpi.Data.Seed;

public static class ProductSeeder
{
    public static async Task SeedProductsAsync(this Dsw2025TpiContext context)
    {
        // Eliminar todos los productos existentes
        var existingProducts = await context.Products.ToListAsync();
        if (existingProducts.Any())
        {
            context.Products.RemoveRange(existingProducts);
            await context.SaveChangesAsync();
        }
        
        // Verificar si ya existen productos (por si acaso)
        if (await context.Products.AnyAsync())
            return;

        // Crear 30 productos electrónicos
        var products = new List<Product>
        {
        
        };

        await context.Products.AddRangeAsync(products);
        await context.SaveChangesAsync();
    }
}

