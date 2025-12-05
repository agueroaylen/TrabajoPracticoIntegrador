using Dsw2025Tpi.Application.Dtos;
using Dsw2025Tpi.Application.Services.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;
using Microsoft.EntityFrameworkCore;
using Dsw2025Tpi.Data;
using Dsw2025Tpi.Domain.Entities;
using System.Text.Json.Serialization;

namespace Dsw2025Tpi.Api.Controllers;

// DTO para crear orden sin autenticación (acepta strings para ProductId)
public record CreateOrderRequest(string Username, string ShippingAddress, string BillingAddress, List<OrderItemRequestDto> OrderItems);
public record OrderItemRequestDto(string ProductId, int Quantity);

// DTO para respuesta paginada de órdenes
public class PaginatedOrdersResponseDto
{
    public List<OrderModel.OrderResponse> Orders { get; set; } = new();
    public int TotalCount { get; set; }
    public int PageNumber { get; set; }
    public int PageSize { get; set; }
    public int TotalPages { get; set; }
}

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
        var paginatedResponse = await _orderService.GetAllOrdersAsync(Status, CustomerId, PageNumber, PageSize);
        
        // Usar el DTO directamente - la configuración de camelCase en Program.cs lo serializará correctamente
        var responseDto = new PaginatedOrdersResponseDto
        {
            Orders = paginatedResponse.Orders.ToList(),
            TotalCount = paginatedResponse.TotalCount,
            PageNumber = paginatedResponse.PageNumber,
            PageSize = paginatedResponse.PageSize,
            TotalPages = paginatedResponse.TotalPages
        };
        
        // Devolver usando Ok() como los otros controladores
        return Ok(responseDto);
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

    // Endpoint para generar órdenes de prueba (solo desarrollo)
    [HttpPost("generate-test-orders")]
    public async Task<IActionResult> GenerateTestOrders([FromQuery] int count = 20)
    {
        try
        {
            // Obtener productos activos
            var products = await _context.Products
                .Where(p => p.IsActive && p.StockQuantity > 0)
                .Take(5)
                .ToListAsync();

            if (!products.Any())
            {
                return BadRequest(new { error = "No hay productos disponibles para crear órdenes de prueba" });
            }

            // Obtener o crear un cliente de prueba
            var testCustomer = await _context.Customers
                .FirstOrDefaultAsync(c => c.Name == "ClienteTest");

            if (testCustomer == null)
            {
                testCustomer = new Customer
                {
                    Id = Guid.NewGuid(),
                    Name = "ClienteTest",
                    EMail = "cliente.test@example.com",
                    PhoneNumber = "123456789"
                };
                _context.Customers.Add(testCustomer);
                await _context.SaveChangesAsync();
            }

            var random = new Random();
            var createdOrders = new List<OrderModel.OrderResponse>();

            for (int i = 0; i < count; i++)
            {
                // Seleccionar un producto aleatorio
                var product = products[random.Next(products.Count)];
                var quantity = random.Next(1, Math.Min(5, product.StockQuantity) + 1);

                // Crear la orden
                var orderRequest = new OrderModel.OrderRequest(
                    testCustomer.Id,
                    $"Dirección de Envío Test {i + 1}",
                    $"Dirección de Facturación Test {i + 1}",
                    new List<OrderModel.OrderItemRequest>
                    {
                        new OrderModel.OrderItemRequest(product.Id, quantity)
                    }
                );

                var created = await _orderService.CreateOrderAsync(orderRequest);
                createdOrders.Add(created);
            }

            return Ok(new { message = $"Se crearon {count} órdenes de prueba exitosamente", orders = createdOrders });
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { error = $"Error al crear órdenes de prueba: {ex.Message}", details = ex.ToString() });
        }
    }
}