using FlowMarket.Domain.Entities.Orders;

namespace FlowMarket.Application.Orders.Dto;

public class UpdateOrderStatusDto
{
    public OrderStatus Status { get; set; }
}