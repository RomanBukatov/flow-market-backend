using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using FlowMarket.Application.Shops.Dto;

namespace FlowMarket.Application.Shops.Interfaces
{
    public interface IShopService
    {
        Task<ShopDto> CreateShopAsync(CreateShopDto dto, Guid userId);
        Task<List<ShopDto>> GetUserShopsAsync(Guid userId);
        Task<ShopDto> UpdateShopAsync(UpdateShopDto dto, Guid userId);
    }
}