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
    public class DeliveryZoneService : IDeliveryZoneService
    {
        private readonly AppDbContext _context;
        private readonly IMapper _mapper;

        public DeliveryZoneService(AppDbContext context, IMapper mapper)
        {
            _context = context;
            _mapper = mapper;
        }

        public async Task<DeliveryZoneDto> CreateZoneAsync(CreateDeliveryZoneDto dto, Guid userId)
        {
            var shop = await _context.Shops.FirstOrDefaultAsync(s => s.OwnerId == userId);
            if (shop == null)
            {
                throw new Exception("Магазин не найден");
            }

            var zone = _mapper.Map<DeliveryZone>(dto);
            zone.ShopId = shop.Id;

            _context.DeliveryZones.Add(zone);
            await _context.SaveChangesAsync();

            return _mapper.Map<DeliveryZoneDto>(zone);
        }

        public async Task<List<DeliveryZoneDto>> GetMyZonesAsync(Guid userId)
        {
            var zones = await _context.DeliveryZones
                .Include(dz => dz.Shop)
                .Where(dz => dz.Shop.OwnerId == userId)
                .ToListAsync();

            return _mapper.Map<List<DeliveryZoneDto>>(zones);
        }

        public async Task DeleteZoneAsync(Guid zoneId, Guid userId)
        {
            var zone = await _context.DeliveryZones
                .Include(dz => dz.Shop)
                .FirstOrDefaultAsync(dz => dz.Id == zoneId);

            if (zone == null)
            {
                throw new Exception("Зона доставки не найдена");
            }

            if (zone.Shop.OwnerId != userId)
            {
                throw new Exception("Нет прав на удаление зоны");
            }

            _context.DeliveryZones.Remove(zone);
            await _context.SaveChangesAsync();
        }
    }
}