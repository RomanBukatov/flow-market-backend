using System;
using System.Threading.Tasks;
using FlowMarket.Application.Catalog.Dto;

namespace FlowMarket.Application.Products.Interfaces
{
    public interface IProductManagementService
    {
        Task<ProductDto> CreateProductAsync(CreateProductDto dto, Guid userId);
        Task DeleteProductAsync(Guid productId, Guid userId);
    }
}