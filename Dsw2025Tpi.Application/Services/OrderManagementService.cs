using Dsw2025Tpi.Application.Constants;
using Dsw2025Tpi.Application.Dtos;
using Dsw2025Tpi.Application.Exceptions;
using Dsw2025Tpi.Application.Services.Interfaces;
using Dsw2025Tpi.Domain.Entities;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace Dsw2025Tpi.Application.Services;

public class OrderManagementService : IOrderManagementService
{
    private readonly Dsw2025TpiContext _context;

    public OrderManagementService(Dsw2025TpiContext context)
    {
        _context = context;
    }

    //Crear orden
    public async Task<OrderModel.OrderResponse> CreateOrderAsync(OrderModel.OrderRequest request)
    {
        
        if (request.OrderItems == null || !request.OrderItems.Any())
            throw new BusinessException(ErrorMessages.OrderMustContainItems);

        foreach (var item in request.OrderItems)
        {
            if (item.Quantity <= 0)
                throw new BusinessException(ErrorMessages.QuantityMustBeGreaterThanZero);
        }
        
        var customerExists = await _context.Customers.AnyAsync(c => c.Id == request.CustomerId);

        if (!customerExists)
            throw new KeyNotFoundException(ErrorMessages.CustomerNotFound);

        var order = new Order
        {
            Id = Guid.NewGuid(),
            CustomerId = request.CustomerId,
            ShippingAddress = request.ShippingAddress,
            BillingAddress = request.BillingAddress,
            Status = OrderStatus.PENDING,
            OrderItems = new List<OrderItem>(),
            OrderDate = DateTime.UtcNow,
        };

        decimal total = 0;

        foreach (var item in request.OrderItems)
        {
            var product = await _context.Products
                .FirstOrDefaultAsync(p => p.Id == item.ProductId && p.IsActive);

            if (product == null)
                throw new KeyNotFoundException(ErrorMessages.ProductNotFound);

            if (item.Quantity > product.StockQuantity)
                throw new BusinessException(ErrorMessages.InsufficientStock);

            var subtotal = item.Quantity * product.CurrentUnitPrice;

            var orderItem = new OrderItem
            {
                Id = Guid.NewGuid(),
                OrderId = order.Id, // Establecer el OrderId
                ProductId = product.Id,
                Quantity = item.Quantity,
                UnitPrice = product.CurrentUnitPrice,
                Name = product.Name ?? string.Empty,
                Description = product.Description ?? string.Empty, // Asegurar que no sea null
                SubTotal = subtotal
            };

            order.OrderItems.Add(orderItem);
            product.StockQuantity -= item.Quantity;
            total += subtotal;
        }

        order.TotalAmount = total;

        _context.Orders.Add(order);
        await _context.SaveChangesAsync();

        var customer = await _context.Customers.FirstOrDefaultAsync(c => c.Id == order.CustomerId);

        return new OrderModel.OrderResponse(
            order.Id,
            order.CustomerId,
            customer?.Name ?? "Cliente sin nombre",
            order.ShippingAddress,
            order.BillingAddress,
            order.TotalAmount,
            order.Status.ToString(),
            order.OrderItems.Select(oi => new OrderModel.OrderItemResponse(
                oi.ProductId,
                oi.Name,
                oi.UnitPrice,
                oi.Quantity,
                oi.SubTotal
            )).ToList()
        );
    }

    //Obtener todas las ordenes
    public async Task<IEnumerable<OrderModel.OrderResponse>> GetAllOrdersAsync([FromQuery] string? Status, [FromQuery] Guid? CustomerId, [FromQuery] int PageNumber = 1, [FromQuery] int PageSize = 10)
    {
        var query = _context.Orders
            .Include(o => o.OrderItems)
            .Include(o => o.Customer)
            .AsQueryable();

        if (!string.IsNullOrWhiteSpace(Status))
        {
            if (!Enum.TryParse<OrderStatus>(Status, out var statusEnum))
                throw new BusinessException(ErrorMessages.InvalidOrderStatus);

            query = query.Where(o => o.Status == statusEnum);
        }

        if (CustomerId.HasValue)
        {
            var exists = await _context.Customers.AnyAsync(c => c.Id == CustomerId.Value);
            if (!exists)
                throw new BusinessException(ErrorMessages.CustomerNotFound);

            query = query.Where(o => o.CustomerId == CustomerId.Value);
        }

        var orders = await query
            .OrderBy(o => o.OrderDate)
            .Skip((PageNumber - 1) * PageSize)
            .Take(PageSize)
            .ToListAsync();

        return orders.Select(o => new OrderModel.OrderResponse(
            o.Id,
            o.CustomerId,
            o.Customer?.Name ?? "Cliente sin nombre",
            o.ShippingAddress,
            o.BillingAddress,
            o.TotalAmount,
            o.Status.ToString(),
            o.OrderItems.Select(oi => new OrderModel.OrderItemResponse(
                oi.ProductId,
                oi.Name,
                oi.UnitPrice,
                oi.Quantity,
                oi.SubTotal
            )).ToList()
        ));
    }
    
    //Obtner una orden por ID
    public async Task<OrderModel.OrderResponse> GetOrderByIdAsync(Guid id)
    {
        var order = await _context.Orders
            .Include(o => o.OrderItems)
            .Include(o => o.Customer)
            .FirstOrDefaultAsync(o => o.Id == id);

        if (order == null)
            throw new KeyNotFoundException(ErrorMessages.OrderNotFound);
        
        return new OrderModel.OrderResponse(
            order.Id,
            order.CustomerId,
            order.Customer?.Name ?? "Cliente sin nombre",
            order.ShippingAddress,
            order.BillingAddress,
            order.TotalAmount,
            order.Status.ToString(),
            order.OrderItems.Select(oi => new OrderModel.OrderItemResponse(
                oi.ProductId,
                oi.Name,
                oi.UnitPrice,
                oi.Quantity,
                oi.SubTotal
            )).ToList()
        );
    }

    //Actualizar una orden
    public async Task<OrderModel.OrderResponse> UpdateOrderStatusAsync(Guid id, OrderModel.UpdateStatusRequest request)
    {
        var order = await _context.Orders
            .Include(o => o.OrderItems)
            .FirstOrDefaultAsync(o => o.Id == id);

        if (order == null)
            throw new KeyNotFoundException(ErrorMessages.OrderNotFound);

        if (!Enum.TryParse<OrderStatus>(request.NewStatus, ignoreCase: true, out var parsedStatus))
            throw new BusinessException(ErrorMessages.InvalidOrderStatus);

        var allowedTransitions = new Dictionary<string, List<string>>
        {
            [OrderStatus.PENDING.ToString().ToUpper()] = new() { OrderStatus.PROCESSING.ToString().ToUpper(), OrderStatus.CANCELLED.ToString().ToUpper(), OrderStatus.DELIVERED.ToString().ToUpper() },
            [OrderStatus.PROCESSING.ToString().ToUpper()] = new() { OrderStatus.SHIPPED.ToString().ToUpper(), OrderStatus.CANCELLED.ToString().ToUpper(), OrderStatus.DELIVERED.ToString().ToUpper() },
            [OrderStatus.SHIPPED.ToString().ToUpper()] = new() { OrderStatus.DELIVERED.ToString().ToUpper() },
            [OrderStatus.DELIVERED.ToString().ToUpper()] = new() { OrderStatus.PENDING.ToString().ToUpper() }, // Permitir volver a pendiente
            [OrderStatus.CANCELLED.ToString().ToUpper()] = new()
        };

        var currentStatus = order.Status.ToString().ToUpper();
        var newStatusUpper = request.NewStatus.ToUpper();
        
        if (!allowedTransitions.TryGetValue(currentStatus, out var allowed) || !allowed.Contains(newStatusUpper))
            throw new BusinessException(string.Format(ErrorMessages.InvalidStatusTransition, currentStatus, request.NewStatus));

        order.Status = parsedStatus;
        await _context.SaveChangesAsync();

        var customer = await _context.Customers.FirstOrDefaultAsync(c => c.Id == order.CustomerId);

        return new OrderModel.OrderResponse(
            order.Id,
            order.CustomerId,
            customer?.Name ?? "Cliente sin nombre",
            order.ShippingAddress,
            order.BillingAddress,
            order.TotalAmount,
            order.Status.ToString(),
            order.OrderItems.Select(oi => new OrderModel.OrderItemResponse(
                oi.ProductId,
                oi.Name,
                oi.UnitPrice,
                oi.Quantity,
                oi.SubTotal
            )).ToList()
        );
    }
}
