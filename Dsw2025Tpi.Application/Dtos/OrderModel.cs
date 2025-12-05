using Microsoft.AspNetCore.Mvc;

namespace Dsw2025Tpi.Application.Dtos;

public record OrderModel
{
    public record OrderRequest(Guid CustomerId, string ShippingAddress, string BillingAddress, List<OrderItemRequest> OrderItems);
    public record OrderResponse(Guid Id, Guid CustomerId, string CustomerName, string ShippingAddress, string BillingAddress, decimal TotalAmount, string Status, List<OrderItemResponse> Items);
    public record UpdateStatusRequest(string NewStatus);
    public record OrderItemRequest(Guid ProductId, int Quantity);
    public record OrderItemResponse(Guid ProductId, string Name, decimal UnitPrice, int Quantity, decimal Subtotal);
    public record PaginatedOrdersResponse(
        List<OrderResponse> Orders,
        int TotalCount,
        int PageNumber,
        int PageSize,
        int TotalPages
    );
}

