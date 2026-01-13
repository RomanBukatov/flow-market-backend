using System;

namespace FlowMarket.Application.Catalog.Dto
{
    public class UpdateProductDto
    {
        public string? Name { get; set; }
        public string? Description { get; set; }
        public decimal? BasePrice { get; set; }
        public double? HeightCm { get; set; }
        public double? WidthCm { get; set; }
        public int? AssemblyTimeMinutes { get; set; }
        public string? ImageUrl { get; set; }
        public string? Color { get; set; }
        public string? Occasion { get; set; }
        public bool? IsDailyOffer { get; set; }
    }
}