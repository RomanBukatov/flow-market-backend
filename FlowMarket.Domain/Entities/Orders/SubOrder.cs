using System.Collections.Generic;
using Marketplace.Domain.Entities.Base;
using Marketplace.Domain.Entities.Shops;

namespace Marketplace.Domain.Entities.Orders
{
    public class SubOrder : BaseEntity
    {
        public OrderStatus Status { get; set; }
        public string? ProofPhotoUrl { get; set; }
        public decimal ShopAmount { get; set; }
        public decimal PlatformCommission { get; set; }
        public Guid OrderId { get; set; }
        public Order Order { get; set; }
        public Guid ShopId { get; set; }
        public Shop Shop { get; set; }
        public ICollection<OrderItem> Items { get; set; }
    }
}