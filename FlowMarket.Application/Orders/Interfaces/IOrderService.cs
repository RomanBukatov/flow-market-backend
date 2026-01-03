using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using FlowMarket.Application.Orders.Dto;

namespace FlowMarket.Application.Orders.Interfaces;

public interface IOrderService
{
    Task<OrderResultDto> CreateOrderAsync(CreateOrderDto dto, Guid? userId);
    Task<List<SellerOrderDto>> GetSellerOrdersAsync(Guid userId);
}