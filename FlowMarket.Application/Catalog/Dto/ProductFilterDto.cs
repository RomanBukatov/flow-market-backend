namespace FlowMarket.Application.Catalog.Dto
{
    public class ProductFilterDto
    {
        public decimal? MinPrice { get; set; }
        public decimal? MaxPrice { get; set; }
        public string? Color { get; set; } 
        public int? MaxAssemblyTime { get; set; } 
        public string? Search { get; set; } 
        public string? Occasion { get; set; }
        public Guid? ShopId { get; set; }
        public bool? IsDailyOffer { get; set; }
        public string? City { get; set; }
        public double? MinHeight { get; set; }
        public double? MaxHeight { get; set; }
        public double? MinWidth { get; set; }
        public double? MaxWidth { get; set; }
    }
}