namespace FlowMarket.Application.Catalog.Dto
{
    public class ProductFilterDto
    {
        public decimal? MinPrice { get; set; }
        public decimal? MaxPrice { get; set; }
        public string? Color { get; set; } // "Красный", "Белый"
        public int? MaxAssemblyTime { get; set; } // До 60 мин
        public string? Search { get; set; } // Поиск по названию
    }
}