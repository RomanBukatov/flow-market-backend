using System.Collections.Generic;

namespace FlowMarket.Application.Orders.Dto;

public class CreateOrderDto
{
    public string UserPhone { get; set; }
    public string UserAddress { get; set; }
    public List<CartItemDto> Items { get; set; }
}