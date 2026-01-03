using FlowMarket.Domain.Entities.Base;

namespace FlowMarket.Domain.Entities.Shops
{
    public class DeliveryZone : BaseEntity
    {
        public string ZoneName { get; set; }
        public double RadiusKm { get; set; }
        public decimal Price { get; set; }
        public decimal? FreeDeliveryThreshold { get; set; }
        public Guid ShopId { get; set; }
        public Shop Shop { get; set; }
    }
}