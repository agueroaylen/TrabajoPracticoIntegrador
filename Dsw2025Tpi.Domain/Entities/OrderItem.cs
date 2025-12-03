namespace Dsw2025Tpi.Domain.Entities;

public class OrderItem : EntityBase
{
    public Guid OrderId { get; set; }
    public Order Order { get; set; }
    public Guid ProductId { get; set; }
    public string Name { get; set; }
    public string Description { get; set; }
    public int Quantity { get; set; }
    public decimal UnitPrice { get; set; }
    public decimal SubTotal { get; set; }
}

