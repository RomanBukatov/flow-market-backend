using Marketplace.Domain.Entities.Base;
using Marketplace.Domain.Entities.Products;

namespace Marketplace.Domain.Entities.Orders
{
    public class OrderItem : BaseEntity
    {
        public decimal Price { get; set; }
        public int Quantity { get; set; }
        public Guid SubOrderId { get; set; }
        public Guid ProductId { get; set; }
        public Product Product { get; set; }
    }
}