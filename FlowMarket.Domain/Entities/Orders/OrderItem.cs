using FlowMarket.Domain.Entities.Base;
using FlowMarket.Domain.Entities.Products;

namespace FlowMarket.Domain.Entities.Orders
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