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
    }
}