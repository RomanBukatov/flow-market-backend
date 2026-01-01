using System;

namespace FlowMarket.Application.Shops.Dto
{
    public class ShopDto
    {
        public Guid Id { get; set; }
        public string Name { get; set; }
        public string Description { get; set; }
        public string LogoUrl { get; set; }
        public string City { get; set; }
        public Guid OwnerId { get; set; }
        public bool IsHolidayPricingEnabled { get; set; }
    }
}