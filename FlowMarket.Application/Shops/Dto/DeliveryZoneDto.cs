namespace FlowMarket.Application.Shops.Dto;

public class DeliveryZoneDto
{
    public Guid Id { get; set; }
    public string ZoneName { get; set; }
    public double RadiusKm { get; set; }
    public decimal Price { get; set; }
    public decimal? FreeDeliveryThreshold { get; set; }
}