using System.Collections.Generic;

namespace FlowMarket.Application.Orders.Dto;

public class CreateOrderDto
{
    public string UserPhone { get; set; }
    public string UserAddress { get; set; }
    
    // Новые поля
    public double UserLatitude { get; set; }
    public double UserLongitude { get; set; }
    public decimal BonusesToUse { get; set; }

    public List<CartItemDto> Items { get; set; }
}