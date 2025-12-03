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
            new Product
            {
                Id = Guid.NewGuid(),
                Sku = "ELEC-001",
                InternalCode = "INT-001",
                Name = "iPhone 15 Pro Max",
                Description = "Smartphone Apple con pantalla Super Retina XDR de 6.7 pulgadas, chip A17 Pro, cámara de 48MP y batería de larga duración.",
                CurrentUnitPrice = 1299.99m,
                StockQuantity = 25,
                IsActive = true
            },
            new Product
            {
                Id = Guid.NewGuid(),
                Sku = "ELEC-002",
                InternalCode = "INT-002",
                Name = "Samsung Galaxy S24 Ultra",
                Description = "Smartphone Android con pantalla AMOLED de 6.8 pulgadas, procesador Snapdragon 8 Gen 3, cámara de 200MP y S Pen incluido.",
                CurrentUnitPrice = 1199.99m,
                StockQuantity = 30,
                IsActive = true
            },
            new Product
            {
                Id = Guid.NewGuid(),
                Sku = "ELEC-003",
                InternalCode = "INT-003",
                Name = "MacBook Pro 16 pulgadas",
                Description = "Laptop Apple con chip M3 Pro, 16GB RAM, 512GB SSD, pantalla Liquid Retina XDR y batería de hasta 22 horas.",
                CurrentUnitPrice = 2499.99m,
                StockQuantity = 15,
                IsActive = true
            },
            new Product
            {
                Id = Guid.NewGuid(),
                Sku = "ELEC-004",
                InternalCode = "INT-004",
                Name = "Dell XPS 15",
                Description = "Laptop Dell con procesador Intel Core i7, 16GB RAM, 1TB SSD, pantalla OLED 4K de 15.6 pulgadas y GPU RTX 4060.",
                CurrentUnitPrice = 1899.99m,
                StockQuantity = 20,
                IsActive = true
            },
            new Product
            {
                Id = Guid.NewGuid(),
                Sku = "ELEC-005",
                InternalCode = "INT-005",
                Name = "iPad Pro 12.9 pulgadas",
                Description = "Tablet Apple con chip M2, pantalla Liquid Retina de 12.9 pulgadas, 256GB almacenamiento y soporte para Apple Pencil.",
                CurrentUnitPrice = 1099.99m,
                StockQuantity = 18,
                IsActive = true
            },
            new Product
            {
                Id = Guid.NewGuid(),
                Sku = "ELEC-006",
                InternalCode = "INT-006",
                Name = "Samsung Galaxy Tab S9 Ultra",
                Description = "Tablet Android con pantalla AMOLED de 14.6 pulgadas, procesador Snapdragon 8 Gen 2, 256GB y S Pen incluido.",
                CurrentUnitPrice = 999.99m,
                StockQuantity = 22,
                IsActive = true
            },
            new Product
            {
                Id = Guid.NewGuid(),
                Sku = "ELEC-007",
                InternalCode = "INT-007",
                Name = "AirPods Pro 2",
                Description = "Auriculares inalámbricos Apple con cancelación activa de ruido, audio espacial, resistencia al agua IPX4 y hasta 30 horas de batería.",
                CurrentUnitPrice = 249.99m,
                StockQuantity = 50,
                IsActive = true
            },
            new Product
            {
                Id = Guid.NewGuid(),
                Sku = "ELEC-008",
                InternalCode = "INT-008",
                Name = "Sony WH-1000XM5",
                Description = "Auriculares over-ear con cancelación de ruido líder, audio de alta resolución, batería de 30 horas y carga rápida.",
                CurrentUnitPrice = 399.99m,
                StockQuantity = 35,
                IsActive = true
            },
            new Product
            {
                Id = Guid.NewGuid(),
                Sku = "ELEC-009",
                InternalCode = "INT-009",
                Name = "Apple Watch Series 9",
                Description = "Smartwatch con pantalla Always-On Retina, chip S9, GPS, resistencia al agua y monitoreo de salud avanzado.",
                CurrentUnitPrice = 399.99m,
                StockQuantity = 40,
                IsActive = true
            },
            new Product
            {
                Id = Guid.NewGuid(),
                Sku = "ELEC-010",
                InternalCode = "INT-010",
                Name = "Samsung Galaxy Watch 6 Classic",
                Description = "Smartwatch con pantalla AMOLED de 1.4 pulgadas, procesador Exynos W930, GPS, resistencia al agua y batería de 40 horas.",
                CurrentUnitPrice = 349.99m,
                StockQuantity = 38,
                IsActive = true
            },
            new Product
            {
                Id = Guid.NewGuid(),
                Sku = "ELEC-011",
                InternalCode = "INT-011",
                Name = "PlayStation 5",
                Description = "Consola de videojuegos Sony con procesador AMD Zen 2, GPU RDNA 2, 825GB SSD, control DualSense y soporte 4K/120fps.",
                CurrentUnitPrice = 499.99m,
                StockQuantity = 12,
                IsActive = true
            },
            new Product
            {
                Id = Guid.NewGuid(),
                Sku = "ELEC-012",
                InternalCode = "INT-012",
                Name = "Xbox Series X",
                Description = "Consola de videojuegos Microsoft con procesador AMD Zen 2, GPU RDNA 2, 1TB SSD, soporte 4K/120fps y ray tracing.",
                CurrentUnitPrice = 499.99m,
                StockQuantity = 15,
                IsActive = true
            },
            new Product
            {
                Id = Guid.NewGuid(),
                Sku = "ELEC-013",
                InternalCode = "INT-013",
                Name = "Nintendo Switch OLED",
                Description = "Consola híbrida con pantalla OLED de 7 pulgadas, 64GB almacenamiento, dock mejorado y batería de larga duración.",
                CurrentUnitPrice = 349.99m,
                StockQuantity = 25,
                IsActive = true
            },
            new Product
            {
                Id = Guid.NewGuid(),
                Sku = "ELEC-014",
                InternalCode = "INT-014",
                Name = "LG OLED C3 55 pulgadas",
                Description = "Smart TV OLED 4K con procesador α9 Gen6, HDR10, Dolby Vision, webOS 23, 4 puertos HDMI 2.1 y sonido Dolby Atmos.",
                CurrentUnitPrice = 1299.99m,
                StockQuantity = 8,
                IsActive = true
            },
            new Product
            {
                Id = Guid.NewGuid(),
                Sku = "ELEC-015",
                InternalCode = "INT-015",
                Name = "Samsung QLED Q80C 65 pulgadas",
                Description = "Smart TV QLED 4K con Quantum HDR, procesador Neural Quantum, Tizen OS, gaming hub y sonido Object Tracking Sound.",
                CurrentUnitPrice = 1499.99m,
                StockQuantity = 10,
                IsActive = true
            },
            new Product
            {
                Id = Guid.NewGuid(),
                Sku = "ELEC-016",
                InternalCode = "INT-016",
                Name = "Canon EOS R6 Mark II",
                Description = "Cámara mirrorless full-frame con sensor de 24.2MP, grabación 4K/60p, estabilización de imagen de 5 ejes y autofoco avanzado.",
                CurrentUnitPrice = 2499.99m,
                StockQuantity = 5,
                IsActive = true
            },
            new Product
            {
                Id = Guid.NewGuid(),
                Sku = "ELEC-017",
                InternalCode = "INT-017",
                Name = "Sony Alpha 7 IV",
                Description = "Cámara mirrorless full-frame con sensor de 33MP, grabación 4K/60p, estabilización de imagen de 5 ejes y autofoco en tiempo real.",
                CurrentUnitPrice = 2499.99m,
                StockQuantity = 6,
                IsActive = true
            },
            new Product
            {
                Id = Guid.NewGuid(),
                Sku = "ELEC-018",
                InternalCode = "INT-018",
                Name = "DJI Mini 4 Pro",
                Description = "Drone con cámara 4K/60fps, sensor de 1/1.3 pulgadas, vuelo de hasta 45 minutos, transmisión O4 y detección de obstáculos omnidireccional.",
                CurrentUnitPrice = 1099.99m,
                StockQuantity = 12,
                IsActive = true
            },
            new Product
            {
                Id = Guid.NewGuid(),
                Sku = "ELEC-019",
                InternalCode = "INT-019",
                Name = "Oculus Quest 3",
                Description = "Gafas de realidad virtual con procesador Snapdragon XR2 Gen 2, pantalla de 2064x2208 por ojo, seguimiento de manos y controladores mejorados.",
                CurrentUnitPrice = 499.99m,
                StockQuantity = 20,
                IsActive = true
            },
            new Product
            {
                Id = Guid.NewGuid(),
                Sku = "ELEC-020",
                InternalCode = "INT-020",
                Name = "Nintendo Switch Pro Controller",
                Description = "Controlador profesional con sticks analógicos precisos, vibración HD, batería de 40 horas y diseño ergonómico.",
                CurrentUnitPrice = 69.99m,
                StockQuantity = 45,
                IsActive = true
            },
            new Product
            {
                Id = Guid.NewGuid(),
                Sku = "ELEC-021",
                InternalCode = "INT-021",
                Name = "Logitech MX Master 3S",
                Description = "Mouse inalámbrico ergonómico con sensor de 8000 DPI, rueda MagSpeed, batería de 70 días y conexión multi-dispositivo.",
                CurrentUnitPrice = 99.99m,
                StockQuantity = 60,
                IsActive = true
            },
            new Product
            {
                Id = Guid.NewGuid(),
                Sku = "ELEC-022",
                InternalCode = "INT-022",
                Name = "Keychron K8 Pro",
                Description = "Teclado mecánico inalámbrico con switches Gateron, retroiluminación RGB, soporte para Mac/Windows y batería de 4000mAh.",
                CurrentUnitPrice = 119.99m,
                StockQuantity = 55,
                IsActive = true
            },
            new Product
            {
                Id = Guid.NewGuid(),
                Sku = "ELEC-023",
                InternalCode = "INT-023",
                Name = "Samsung 980 PRO 2TB SSD",
                Description = "SSD NVMe PCIe 4.0 con velocidades de lectura de 7000MB/s, escritura de 5000MB/s, ideal para gaming y trabajo profesional.",
                CurrentUnitPrice = 199.99m,
                StockQuantity = 40,
                IsActive = true
            },
            new Product
            {
                Id = Guid.NewGuid(),
                Sku = "ELEC-024",
                InternalCode = "INT-024",
                Name = "Corsair Vengeance DDR5 32GB",
                Description = "Memoria RAM DDR5 de 32GB (2x16GB) a 6000MHz, latencia CL36, compatible con Intel y AMD, diseño RGB.",
                CurrentUnitPrice = 149.99m,
                StockQuantity = 50,
                IsActive = true
            },
            new Product
            {
                Id = Guid.NewGuid(),
                Sku = "ELEC-025",
                InternalCode = "INT-025",
                Name = "NVIDIA GeForce RTX 4070",
                Description = "Tarjeta gráfica con 12GB GDDR6X, arquitectura Ada Lovelace, DLSS 3, ray tracing y soporte para 4K gaming.",
                CurrentUnitPrice = 599.99m,
                StockQuantity = 8,
                IsActive = true
            },
            new Product
            {
                Id = Guid.NewGuid(),
                Sku = "ELEC-026",
                InternalCode = "INT-026",
                Name = "AMD Ryzen 9 7900X",
                Description = "Procesador de 12 núcleos y 24 hilos, frecuencia base de 4.7GHz, boost de 5.6GHz, socket AM5 y arquitectura Zen 4.",
                CurrentUnitPrice = 449.99m,
                StockQuantity = 15,
                IsActive = true
            },
            new Product
            {
                Id = Guid.NewGuid(),
                Sku = "ELEC-027",
                InternalCode = "INT-027",
                Name = "Razer DeathAdder V3 Pro",
                Description = "Mouse gaming inalámbrico con sensor Focus Pro 30K, diseño ergonómico, batería de 90 horas y peso de 63g.",
                CurrentUnitPrice = 149.99m,
                StockQuantity = 35,
                IsActive = true
            },
            new Product
            {
                Id = Guid.NewGuid(),
                Sku = "ELEC-028",
                InternalCode = "INT-028",
                Name = "SteelSeries Arctis Nova Pro",
                Description = "Auriculares gaming con cancelación de ruido activa, sonido 360°, batería dual swappable y compatibilidad multiplataforma.",
                CurrentUnitPrice = 349.99m,
                StockQuantity = 25,
                IsActive = true
            },
            new Product
            {
                Id = Guid.NewGuid(),
                Sku = "ELEC-029",
                InternalCode = "INT-029",
                Name = "Elgato Stream Deck MK.2",
                Description = "Panel de control con 15 teclas LCD personalizables, integración con OBS, Twitch, YouTube y más de 1000 plugins.",
                CurrentUnitPrice = 149.99m,
                StockQuantity = 30,
                IsActive = true
            },
            new Product
            {
                Id = Guid.NewGuid(),
                Sku = "ELEC-030",
                InternalCode = "INT-030",
                Name = "Anker PowerCore 26800mAh",
                Description = "Batería externa con capacidad de 26800mAh, carga rápida Power Delivery, 3 puertos USB y diseño compacto.",
                CurrentUnitPrice = 79.99m,
                StockQuantity = 70,
                IsActive = true
            }
        };

        await context.Products.AddRangeAsync(products);
        await context.SaveChangesAsync();
    }
}

