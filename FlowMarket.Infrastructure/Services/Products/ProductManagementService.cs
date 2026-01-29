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
            product.Description = dto.Description ?? ""; // <--- ЗАЩИТА ОТ NULL
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

        public async Task<ProductDto> UpdateProductAsync(Guid productId, UpdateProductDto dto, Guid userId)
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
                throw new Exception("У вас нет прав на редактирование этого товара");
            }

            if (dto.Name != null)
            {
                product.Name = dto.Name;
            }
            if (dto.Description != null)
            {
                product.Description = dto.Description;
            }
            if (dto.BasePrice != null)
            {
                product.BasePrice = dto.BasePrice.Value;
            }
            if (dto.HeightCm != null)
            {
                product.HeightCm = dto.HeightCm.Value;
            }
            if (dto.WidthCm != null)
            {
                product.WidthCm = dto.WidthCm.Value;
            }
            if (dto.AssemblyTimeMinutes != null)
            {
                product.AssemblyTimeMinutes = dto.AssemblyTimeMinutes.Value;
            }
            if (dto.ImageUrl != null)
            {
                product.ImageUrl = dto.ImageUrl;
            }
            if (dto.Color != null)
            {
                product.Color = dto.Color;
            }
            if (dto.Occasion != null)
            {
                product.Occasion = dto.Occasion;
            }
            if (dto.Images != null)
            {
                product.Images = dto.Images;
            }
            
            await _context.SaveChangesAsync();

            return _mapper.Map<ProductDto>(product);
        }
    }
}