using Marketplace.Domain.Entities.Base;
using Marketplace.Domain.Entities.Shops;

namespace Marketplace.Domain.Entities.Products
{
    public class Product : BaseEntity
    {
        public string Name { get; set; }
        public string Description { get; set; }
        public decimal BasePrice { get; set; }
        public double HeightCm { get; set; }
        public double WidthCm { get; set; }
        public bool IsDailyOffer { get; set; }
        public DateTime? AutoHideAt { get; set; }
        public string CompositionJson { get; set; }
        public Guid ShopId { get; set; }
        public Shop Shop { get; set; }
    }
}