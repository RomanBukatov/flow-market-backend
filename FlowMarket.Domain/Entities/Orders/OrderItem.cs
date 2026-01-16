using FlowMarket.Domain.Entities.Base;
using FlowMarket.Domain.Entities.Products;

namespace FlowMarket.Domain.Entities.Orders
{
    public class OrderItem : BaseEntity
    {
        public Guid SubOrderId { get; set; }
        
        public Guid ProductId { get; set; }
        public Product Product { get; set; }

        public int Quantity { get; set; }
        public decimal Price { get; set; } // Цена за штуку (уже была)

        // == НОВЫЕ ПОЛЯ (Снэпшот) ==
        public string ProductName { get; set; } = string.Empty;
        public string? ProductImageUrl { get; set; }
    }
}