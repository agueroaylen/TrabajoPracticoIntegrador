using Dsw2025Tpi.Application.Dtos;
using Dsw2025Tpi.Application.Services.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;
using Microsoft.EntityFrameworkCore;
using Dsw2025Tpi.Data;
using Dsw2025Tpi.Domain.Entities;

namespace Dsw2025Tpi.Api.Controllers;

// DTO para crear orden sin autenticación (acepta strings para ProductId)
public record CreateOrderRequest(string Username, string ShippingAddress, string BillingAddress, List<OrderItemRequestDto> OrderItems);
public record OrderItemRequestDto(string ProductId, int Quantity);

[ApiController]
[Route("api/[controller]")]
public class OrdersController : ControllerBase
{
    private readonly IOrderManagementService _orderService;
    private readonly Dsw2025TpiContext _context;

    public OrdersController(IOrderManagementService orderService, Dsw2025TpiContext context)
    {
        _orderService = orderService;
        _context = context;
    }

    //Crear una orden (sin autenticación requerida)
    [HttpPost]
    public async Task<IActionResult> CreateOrder([FromBody] CreateOrderRequest request)
    {
        try
        {
            if (request == null)
            {
                return BadRequest(new { error = "El request no puede ser nulo" });
            }

            if (string.IsNullOrEmpty(request.Username))
            {
                return BadRequest(new { error = "El nombre de usuario es requerido" });
            }

            if (request.OrderItems == null || !request.OrderItems.Any())
            {
                return BadRequest(new { error = "La orden debe contener al menos un item" });
            }

            // Buscar el customer por nombre (Name field)
            var customer = await _context.Customers
                .FirstOrDefaultAsync(c => c.Name == request.Username);
            
            // Si no existe el customer, crearlo automáticamente
            if (customer == null)
    {
                customer = new Customer
                {
                    Id = Guid.NewGuid(),
                    Name = request.Username,
                    EMail = $"{request.Username}@example.com", // Email por defecto
                    PhoneNumber = string.Empty // Usar string vacío en lugar de null para SQLite
                };
                
                _context.Customers.Add(customer);
                await _context.SaveChangesAsync();
            }

            // Convertir ProductIds de string a Guid
            var orderItems = request.OrderItems.Select(item =>
            {
                if (!Guid.TryParse(item.ProductId, out var productId))
                {
                    throw new ArgumentException($"El ProductId '{item.ProductId}' no es un GUID válido");
                }
                
                return new OrderModel.OrderItemRequest(productId, item.Quantity);
            }).ToList();

            // Crear la orden con el customerId encontrado
            var orderRequest = new OrderModel.OrderRequest(
                customer.Id,
                request.ShippingAddress,
                request.BillingAddress,
                orderItems
            );

            var created = await _orderService.CreateOrderAsync(orderRequest);
        return CreatedAtAction(nameof(GetOrderById), new { id = created.Id }, created);
        }
        catch (Exception ex)
        {
            // Log del error completo para debugging
            return StatusCode(500, new { error = $"Error al crear la orden: {ex.Message}", details = ex.ToString() });
        }
    }

    //Listar todas las órdenes
    [Authorize(Roles = "admin, customer")]
    [HttpGet]
    public async Task<IActionResult> GetAllOrders([FromQuery] string? Status, [FromQuery] Guid? CustomerId, [FromQuery] int PageNumber = 1, [FromQuery] int PageSize = 10)
    {
        var orders = await _orderService.GetAllOrdersAsync(Status, CustomerId, PageNumber, PageSize);
        return Ok(orders);
    }

    //Obtener una orden por ID
    [Authorize(Roles = "customer,admin")]
    [HttpGet("{id}")]
    public async Task<IActionResult> GetOrderById(Guid id)
    {
        var order = await _orderService.GetOrderByIdAsync(id);
        return Ok(order);
    }

    //Actualizar el estado de una orden
    [Authorize(Roles = "admin")]
    [HttpPut("{id}/status")]
    public async Task<IActionResult> UpdateOrderStatus(Guid id, [FromBody] OrderModel.UpdateStatusRequest request)
    {
        var updated = await _orderService.UpdateOrderStatusAsync(id, request);
        return Ok(updated); 
    }
}