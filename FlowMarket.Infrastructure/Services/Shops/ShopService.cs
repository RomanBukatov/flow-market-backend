using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using AutoMapper;
using FlowMarket.Application.Catalog.Dto; // <--- ВАЖНО: для ProductDto
using FlowMarket.Application.Common.Models; // <--- ВАЖНО: для PagedResult
using FlowMarket.Application.Shops.Dto;
using FlowMarket.Application.Shops.Interfaces;
using FlowMarket.Domain.Entities.Orders;
using FlowMarket.Domain.Entities.Shops;
using FlowMarket.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;

namespace FlowMarket.Infrastructure.Services.Shops
{
    public class ShopService : IShopService
    {
        private readonly AppDbContext _context;
        private readonly IMapper _mapper;

        public ShopService(AppDbContext context, IMapper mapper)
        {
            _context = context;
            _mapper = mapper;
        }

        public async Task<ShopDto> CreateShopAsync(CreateShopDto dto, Guid userId)
        {
            var shop = _mapper.Map<Shop>(dto);
            shop.OwnerId = userId;
            shop.IsHolidayPricingEnabled = false;

            _context.Shops.Add(shop);
            await _context.SaveChangesAsync();

            return _mapper.Map<ShopDto>(shop);
        }

        public async Task<List<ShopDto>> GetUserShopsAsync(Guid userId)
        {
            var shops = await _context.Shops
                .Where(s => s.OwnerId == userId)
                .ToListAsync();

            return _mapper.Map<List<ShopDto>>(shops);
        }

        public async Task<ShopDto> UpdateShopAsync(UpdateShopDto dto, Guid userId)
        {
            var shop = await _context.Shops.FirstOrDefaultAsync(s => s.OwnerId == userId);

            if (shop == null)
            {
                throw new Exception("Магазин не найден. Сначала создайте его.");
            }

            if (!string.IsNullOrEmpty(dto.Description)) shop.Description = dto.Description;
            if (!string.IsNullOrEmpty(dto.LogoUrl)) shop.LogoUrl = dto.LogoUrl;
            if (!string.IsNullOrEmpty(dto.City)) shop.City = dto.City;

            shop.Latitude = dto.Latitude;
            shop.Longitude = dto.Longitude;
            shop.IsHolidayPricingEnabled = dto.IsHolidayPricingEnabled; // Не забываем про наценку

            await _context.SaveChangesAsync();

            return _mapper.Map<ShopDto>(shop);
        }

        public async Task<ShopDto> GetShopByIdAsync(Guid id)
        {
            var shop = await _context.Shops
                .Include(s => s.DeliveryZones)
                .FirstOrDefaultAsync(s => s.Id == id);

            if (shop == null) return null;

            return _mapper.Map<ShopDto>(shop);
        }

        public async Task<ShopStatsDto> GetShopStatsAsync(Guid userId)
        {
            var shop = await _context.Shops.FirstOrDefaultAsync(s => s.OwnerId == userId);
            if (shop == null) return new ShopStatsDto();

            var orders = await _context.SubOrders
                .Where(so => so.ShopId == shop.Id)
                .ToListAsync();

            var completedOrders = orders.Where(o => o.Status == OrderStatus.Completed).ToList();

            var stats = new ShopStatsDto
            {
                TotalOrders = orders.Count,
                CompletedOrders = completedOrders.Count,
                TotalRevenue = completedOrders.Sum(o => o.ShopAmount),
            };

            if (stats.CompletedOrders > 0)
            {
                stats.AverageCheck = Math.Round(stats.TotalRevenue / stats.CompletedOrders, 0);
            }

            return stats;
        }

        // === ВОТ ЭТОТ МЕТОД МЫ ДОБАВЛЯЕМ ===
        public async Task<PagedResult<ProductDto>> GetMyProductsAsync(Guid userId, int page, int pageSize, string search)
        {
            // 1. Находим магазин селлера
            var shop = await _context.Shops.FirstOrDefaultAsync(s => s.OwnerId == userId);
            
            // Если магазина нет, возвращаем пустой список
            if (shop == null) 
                return new PagedResult<ProductDto>(new List<ProductDto>(), 0, page, pageSize);

            // 2. Строим запрос
            var query = _context.Products
                .AsNoTracking()
                .Where(p => p.ShopId == shop.Id && !p.IsDeleted) // Только товары этого магазина
                .AsQueryable();

            // 3. Поиск
            if (!string.IsNullOrEmpty(search))
            {
                query = query.Where(p => p.Name.ToLower().Contains(search.ToLower()));
            }

            // 4. Считаем общее кол-во
            var totalCount = await query.CountAsync();

            // 5. Пагинация
            var items = await query
                .OrderByDescending(p => p.CreatedAt)
                .Skip((page - 1) * pageSize)
                .Take(pageSize)
                .ToListAsync();

            // 6. Маппинг и возврат
            var dtos = _mapper.Map<List<ProductDto>>(items);
            return new PagedResult<ProductDto>(dtos, totalCount, page, pageSize);
        }
    }
}