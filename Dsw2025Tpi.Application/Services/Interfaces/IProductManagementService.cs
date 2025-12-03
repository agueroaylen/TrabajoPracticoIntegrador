using Dsw2025Tpi.Application.Dtos;

namespace Dsw2025Tpi.Application.Services.Interfaces;

public interface IProductManagementService
{
    Task<ProductModel.ProductResponse> CreateProductAsync(ProductModel.ProductRequest request);
    Task<IEnumerable<ProductModel.ProductResponse>> GetAllProductsAsync();
    Task<IEnumerable<ProductModel.ProductResponse>> GetAllProductsForAdminAsync();
    Task<ProductModel.ProductResponse> GetProductByIdAsync(Guid id);
    Task<ProductModel.ProductResponse> GetProductByIdForAdminAsync(Guid id);
    Task<ProductModel.ProductResponse> UpdateProductAsync(Guid id, ProductModel.ProductRequest request);
    Task DisableProductAsync(Guid id);
    Task EnableProductAsync(Guid id);
}



