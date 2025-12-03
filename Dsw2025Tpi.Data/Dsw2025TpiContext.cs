using Microsoft.EntityFrameworkCore;
using Dsw2025Tpi.Domain.Entities;

public class Dsw2025TpiContext : DbContext
{
    public Dsw2025TpiContext(DbContextOptions<Dsw2025TpiContext> options) : base(options) { }
    public DbSet<Product> Products { get; set; }
    public DbSet<Order> Orders { get; set; }
    public DbSet<OrderItem> OrderItems { get; set; }
    public DbSet<Customer> Customers { get; set; }

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        // Productos
        modelBuilder.Entity<Product>(eb =>
        {
            eb.ToTable("Products");

            eb.HasKey(p => p.Id);

            eb.Property(p => p.Sku)
                .IsRequired();

            eb.HasIndex(p => p.Sku)
                .IsUnique();

            eb.Property(p => p.Name)
                .IsRequired();

            eb.Property(p => p.CurrentUnitPrice)
                .HasPrecision(15, 2)
                .IsRequired();

            eb.Property(p => p.StockQuantity)
                .IsRequired();

            eb.Property(p => p.IsActive)
                .HasDefaultValue(true)
                .IsRequired();
        });

        // Ordenes
        modelBuilder.Entity<Order>(eb =>
        {
            eb.ToTable("Orders");

            eb.HasKey(o => o.Id);

            eb.Property(o => o.CustomerId).IsRequired();
            eb.Property(o => o.ShippingAddress).IsRequired();
            eb.Property(o => o.BillingAddress).IsRequired();

            eb.Property(o => o.Status)
            .IsRequired()
            .HasConversion( // Convertir enum a string en DB
            v => v.ToString(),
            v => (OrderStatus)Enum.Parse(typeof(OrderStatus), v)
             );

            eb.Property(o => o.OrderDate)
                .IsRequired();

            eb.Property(o => o.TotalAmount)
                .HasPrecision(15, 2)
                .IsRequired();

            eb.HasMany(o => o.OrderItems)
                .WithOne(oi => oi.Order)
                .HasForeignKey(oi => oi.OrderId)
                .OnDelete(DeleteBehavior.Cascade);
        });

        // OrderItem
        modelBuilder.Entity<OrderItem>(eb =>
        {
            eb.ToTable("OrderItems");

            eb.HasKey(oi => oi.Id);

            eb.Property(oi => oi.Name)
                .IsRequired();

            eb.Property(oi => oi.Description)
                .IsRequired(false); // Asegurar que permite null

            eb.Property(oi => oi.Quantity)
                .IsRequired();

            eb.Property(oi => oi.UnitPrice)
                .HasPrecision(15, 2)
                .IsRequired();

            eb.Property(oi => oi.SubTotal)
                .HasPrecision(15, 2)
                .IsRequired();

        });

        // Cliente
        modelBuilder.Entity<Customer>(eb =>
        {
            eb.ToTable("Customers");

            eb.HasKey(c => c.Id);

            eb.Property(c => c.EMail)
                .IsRequired();

            eb.Property(c => c.Name)
                .IsRequired();

            eb.Property(c => c.PhoneNumber)
                .IsRequired(false); // Asegurar que permite null

            eb.HasMany(c => c.Orders)
                .WithOne(o => o.Customer)
                .HasForeignKey(o => o.CustomerId)
                .OnDelete(DeleteBehavior.Restrict);
        });
    }
}
