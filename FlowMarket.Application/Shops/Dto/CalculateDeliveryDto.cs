namespace FlowMarket.Application.Shops.Dto;

public class CalculateDeliveryDto
{
    public Guid ShopId { get; set; }
    public double UserLatitude { get; set; }
    public double UserLongitude { get; set; }
    public decimal? OrderTotalAmount { get; set; } // Для расчета бесплатной доставки
}