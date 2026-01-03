using System;
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
            if (shop == null) throw new Exception("Магазин не найден");
            var zone = _mapper.Map<DeliveryZone>(dto);
            zone.ShopId = shop.Id;
            _context.DeliveryZones.Add(zone);
            await _context.SaveChangesAsync();
            return _mapper.Map<DeliveryZoneDto>(zone);
        }

        public async Task<List<DeliveryZoneDto>> GetMyZonesAsync(Guid userId)
        {
            var zones = await _context.DeliveryZones.Include(dz => dz.Shop).Where(dz => dz.Shop.OwnerId == userId).ToListAsync();
            return _mapper.Map<List<DeliveryZoneDto>>(zones);
        }

        public async Task DeleteZoneAsync(Guid zoneId, Guid userId)
        {
            var zone = await _context.DeliveryZones.Include(dz => dz.Shop).FirstOrDefaultAsync(dz => dz.Id == zoneId);
            if (zone == null) throw new Exception("Зона не найдена");
            if (zone.Shop.OwnerId != userId) throw new Exception("Нет прав");
            _context.DeliveryZones.Remove(zone);
            await _context.SaveChangesAsync();
        }

        public async Task<decimal> CalculateDeliveryPriceAsync(CalculateDeliveryDto dto)
        {
            // 1. Получаем магазин (чтобы узнать его координаты)
            var shop = await _context.Shops.FindAsync(dto.ShopId);
            if (shop == null) throw new Exception("Магазин не найден");

            // 2. Считаем расстояние (в км) между магазином и юзером
            double distanceKm = CalculateDistance(shop.Latitude, shop.Longitude, dto.UserLatitude, dto.UserLongitude);

            // 3. Ищем подходящие зоны
            var zones = await _context.DeliveryZones
                .Where(z => z.ShopId == dto.ShopId)
                .ToListAsync();

            // Ищем зону, в радиус которой мы попадаем (сортируем по цене или радиусу, берем самую выгодную или точную)
            // Логика: берем зону с минимальным радиусом, в который мы входим.
            var matchingZone = zones
                .Where(z => z.RadiusKm >= distanceKm)
                .OrderBy(z => z.RadiusKm)
                .FirstOrDefault();

            if (matchingZone == null)
            {
                throw new Exception($"Адрес вне зоны доставки. Расстояние: {distanceKm:F2} км.");
            }

            // 4. Проверяем бесплатную доставку
            if (matchingZone.FreeDeliveryThreshold.HasValue && dto.OrderTotalAmount.HasValue)
            {
                if (dto.OrderTotalAmount.Value >= matchingZone.FreeDeliveryThreshold.Value)
                {
                    return 0; // Бесплатно
                }
            }

            return matchingZone.Price;
        }

        // Формула Haversine (Расстояние на сфере)
        private double CalculateDistance(double lat1, double lon1, double lat2, double lon2)
        {
            var R = 6371; // Радиус Земли (км)
            var dLat = ToRadians(lat2 - lat1);
            var dLon = ToRadians(lon2 - lon1);
            var a = Math.Sin(dLat / 2) * Math.Sin(dLat / 2) +
                    Math.Cos(ToRadians(lat1)) * Math.Cos(ToRadians(lat2)) *
                    Math.Sin(dLon / 2) * Math.Sin(dLon / 2);
            var c = 2 * Math.Atan2(Math.Sqrt(a), Math.Sqrt(1 - a));
            return R * c;
        }

        private double ToRadians(double angle)
        {
            return Math.PI * angle / 180.0;
        }
    }
}