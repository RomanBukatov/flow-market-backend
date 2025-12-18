using System;

namespace FlowMarket.Application.Catalog.Dto
{
    public class ProductDto
    {
        public Guid Id { get; set; }
        public string Name { get; set; }
        public string Description { get; set; }
        public decimal Price { get; set; }
        public string ShopName { get; set; }
        public Guid ShopId { get; set; }
        public string ImageUrl { get; set; }
        public bool IsDailyOffer { get; set; }
        public string Composition { get; set; }
        public int AssemblyTimeMinutes { get; set; }
    }
}