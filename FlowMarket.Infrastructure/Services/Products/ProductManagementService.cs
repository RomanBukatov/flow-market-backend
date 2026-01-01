using System;
using System.Linq;
using System.Threading.Tasks;
using AutoMapper;
using FlowMarket.Application.Catalog.Dto;
using FlowMarket.Application.Products.Interfaces;
using FlowMarket.Domain.Entities.Products;
using FlowMarket.Domain.Entities.Shops;
using FlowMarket.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;

namespace FlowMarket.Infrastructure.Services.Products
{
    public class ProductManagementService : IProductManagementService
    {
        private readonly AppDbContext _context;
        private readonly IMapper _mapper;

        public ProductManagementService(AppDbContext context, IMapper mapper)
        {
            _context = context;
            _mapper = mapper;
        }

        public async Task<ProductDto> CreateProductAsync(CreateProductDto dto, Guid userId)
        {
            var shop = await _context.Shops.FirstOrDefaultAsync(s => s.OwnerId == userId);
            if (shop == null)
            {
                throw new Exception("У вас нет магазина");
            }

            var product = _mapper.Map<Product>(dto);
            product.ShopId = shop.Id;

            _context.Products.Add(product);
            await _context.SaveChangesAsync();

            return _mapper.Map<ProductDto>(product);
        }

        public async Task DeleteProductAsync(Guid productId, Guid userId)
        {
            var product = await _context.Products
                .Include(p => p.Shop)
                .FirstOrDefaultAsync(p => p.Id == productId && !p.IsDeleted);

            if (product == null)
            {
                throw new Exception("Товар не найден");
            }

            if (product.Shop.OwnerId != userId)
            {
                throw new Exception("У вас нет прав на удаление этого товара");
            }

            product.IsDeleted = true;
            await _context.SaveChangesAsync();
        }
    }
}