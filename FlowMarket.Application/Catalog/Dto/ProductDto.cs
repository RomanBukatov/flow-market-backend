using System;
using System.Collections.Generic;

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
        public List<string> Images { get; set; } = new();
        public string? VideoUrl { get; set; }
        public bool IsDailyOffer { get; set; }
        public string Composition { get; set; }
        public int AssemblyTimeMinutes { get; set; }
        public DateTime CreatedAt { get; set; }
        public string Color { get; set; }
        public string Occasion { get; set; }
    }
}