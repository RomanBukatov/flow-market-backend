using System.Collections.Generic;
using FlowMarket.Domain.Entities.Base;
using FlowMarket.Domain.Entities.Users;
using FlowMarket.Domain.Entities.Products;

namespace FlowMarket.Domain.Entities.Shops
{
    public class Shop : BaseEntity
    {
        public string Name { get; set; }
        public string Description { get; set; }
        public string LogoUrl { get; set; }
        public string City { get; set; } = string.Empty;
        public double Latitude { get; set; }
        public double Longitude { get; set; }
        public string? PaymentVendorId { get; set; }
        public bool IsHolidayPricingEnabled { get; set; }
        public Guid OwnerId { get; set; }
        public AppUser Owner { get; set; }
        public ICollection<DeliveryZone> DeliveryZones { get; set; }
        public ICollection<Product> Products { get; set; }
    }
}