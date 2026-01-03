using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using FlowMarket.Application.Shops.Dto;

namespace FlowMarket.Application.Shops.Interfaces;

public interface IDeliveryZoneService
{
    Task<DeliveryZoneDto> CreateZoneAsync(CreateDeliveryZoneDto dto, Guid userId);
    Task<List<DeliveryZoneDto>> GetMyZonesAsync(Guid userId);
    Task DeleteZoneAsync(Guid zoneId, Guid userId);
}