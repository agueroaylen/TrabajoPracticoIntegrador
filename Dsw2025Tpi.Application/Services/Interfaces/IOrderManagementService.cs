using Dsw2025Tpi.Application.Dtos;
using Microsoft.AspNetCore.Mvc;

namespace Dsw2025Tpi.Application.Services.Interfaces
{
    public interface IOrderManagementService
    {
        Task<OrderModel.OrderResponse> CreateOrderAsync(OrderModel.OrderRequest request);
        Task<IEnumerable<OrderModel.OrderResponse>> GetAllOrdersAsync([FromQuery] string? Status, [FromQuery] Guid? CustomerId, [FromQuery] int PageNumber = 1, [FromQuery] int PageSize = 10);
        Task<OrderModel.OrderResponse> GetOrderByIdAsync(Guid id);
        Task<OrderModel.OrderResponse> UpdateOrderStatusAsync(Guid id, OrderModel.UpdateStatusRequest request);
    }
}
