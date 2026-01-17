namespace FlowMarket.Application.Shops.Dto
{
    public class CreateShopDto
    {
        public string Name { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;
        public string City { get; set; } = string.Empty;
        public string? LogoUrl { get; set; }
        
        public double Latitude { get; set; }
        public double Longitude { get; set; }
    }
}