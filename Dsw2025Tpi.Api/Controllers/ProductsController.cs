using Dsw2025Tpi.Application.Services.Interfaces;
using Dsw2025Tpi.Application.Dtos;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;

namespace Dsw2025Tpi.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class ProductsController : ControllerBase
{
    private readonly IProductManagementService _service;

    public ProductsController(IProductManagementService service)
    {
        _service = service;
    }

    // Crear un producto
    [Authorize(Roles = "admin")]
    [HttpPost]
    public async Task<IActionResult> CreateProduct([FromBody] ProductModel.ProductRequest request)
    {
        var created = await _service.CreateProductAsync(request);
        return CreatedAtAction(nameof(GetProductById), new { id = created.Id }, created);
    }

    // Obtener todos los productos
    [HttpGet]
    public async Task<IActionResult> GetAllProducts()
    {
        var products = await _service.GetAllProductsAsync();
        return Ok(products);
    }

    // Obtener todos los productos para admin (incluye inactivos)
    [Authorize(Roles = "admin")]
    [HttpGet("admin/all")]
    public async Task<IActionResult> GetAllProductsForAdmin()
    {
        var products = await _service.GetAllProductsForAdminAsync();
        return Ok(products);
    }

    // Obtener un producto por ID
    [HttpGet("{id}")]
    public async Task<IActionResult> GetProductById(Guid id)
    {
        var product = await _service.GetProductByIdAsync(id);
        return Ok(product); 
    }

    // Obtener un producto por ID para admin (incluye inactivos)
    [Authorize(Roles = "admin")]
    [HttpGet("admin/{id}")]
    public async Task<IActionResult> GetProductByIdForAdmin(Guid id)
    {
        var product = await _service.GetProductByIdForAdminAsync(id);
        return Ok(product); 
    }

    // Actualizar un producto
    [Authorize(Roles = "admin")]
    [HttpPut("{id}")]
    public async Task<IActionResult> UpdateProduct(Guid id, [FromBody] ProductModel.ProductRequest product)
    {
        
        var updated = await _service.UpdateProductAsync(id, product);
        return Ok(updated); 
    }

    // Activar un producto (debe ir antes de la ruta genérica {id} para que ASP.NET Core la reconozca primero)
    [Authorize(Roles = "admin")]
    [HttpPatch("enable/{id}")]
    public async Task<IActionResult> EnableProduct(Guid id)
    {
        await _service.EnableProductAsync(id);
        return NoContent(); 
    }

    // Inhabilitar un producto
    [Authorize(Roles = "admin")]
    [HttpPatch("{id}")]
    public async Task<IActionResult> DisableProduct(Guid id)
    {
        await _service.DisableProductAsync(id);
        return NoContent(); 
    }
}

