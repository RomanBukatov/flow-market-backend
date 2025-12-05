using System.Collections.Generic;
using Marketplace.Domain.Entities.Base;
using Marketplace.Domain.Entities.Users;

namespace Marketplace.Domain.Entities.Orders
{
    public enum OrderStatus
    {
        New,
        Paid,
        Confirmed,
        Assembling,
        PhotoReady,
        Delivering,
        Completed,
        Cancelled
    }

    public class Order : BaseEntity
    {
        public decimal TotalAmount { get; set; }
        public string PaymentTransactionId { get; set; }
        public Guid BuyerId { get; set; }
        public AppUser Buyer { get; set; }
        public ICollection<SubOrder> SubOrders { get; set; }
    }
}