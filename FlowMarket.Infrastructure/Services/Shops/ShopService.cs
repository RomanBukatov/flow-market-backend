using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using AutoMapper;
using FlowMarket.Application.Shops.Dto;
using FlowMarket.Application.Shops.Interfaces;
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
            shop.IsHolidayPricingEnabled = false; // default value

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

            // Обновляем поля, если они переданы (или просто перезаписываем)
            // Можно добавить проверки на null/empty, но для MVP перезапишем всё
            if (!string.IsNullOrEmpty(dto.Description)) shop.Description = dto.Description;
            if (!string.IsNullOrEmpty(dto.LogoUrl)) shop.LogoUrl = dto.LogoUrl;
            if (!string.IsNullOrEmpty(dto.City)) shop.City = dto.City;

            // Координаты обновляем всегда
            shop.Latitude = dto.Latitude;
            shop.Longitude = dto.Longitude;

            await _context.SaveChangesAsync();

            return _mapper.Map<ShopDto>(shop);
        }
    }
}