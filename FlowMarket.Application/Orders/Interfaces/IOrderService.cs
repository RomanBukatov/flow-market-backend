using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using FlowMarket.Application.Orders.Dto;
using FlowMarket.Domain.Entities.Orders;

namespace FlowMarket.Application.Orders.Interfaces;

public interface IOrderService
{
    Task<OrderResultDto> CreateOrderAsync(CreateOrderDto dto, Guid? userId);
    Task<List<SellerOrderDto>> GetSellerOrdersAsync(Guid userId);
    Task ChangeOrderStatusAsync(Guid subOrderId, OrderStatus newStatus, Guid userId);
    Task<List<BuyerOrderDto>> GetBuyerOrdersAsync(Guid buyerId);
    Task ConfirmPaymentAsync(Guid orderId);
}