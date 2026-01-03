namespace FlowMarket.Application.Shops.Dto
{
    public class UpdateShopDto
    {
        public string? Description { get; set; }
        public string? LogoUrl { get; set; }
        public string? City { get; set; }

        // Самое главное для калькулятора:
        public double Latitude { get; set; }
        public double Longitude { get; set; }
    }
}