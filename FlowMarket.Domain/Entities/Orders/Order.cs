using System.Collections.Generic;
using FlowMarket.Domain.Entities.Base;
using FlowMarket.Domain.Entities.Users;

namespace FlowMarket.Domain.Entities.Orders
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
        public Guid? BuyerId { get; set; } // Nullable, если покупает гость
        public AppUser? Buyer { get; set; }

        public decimal TotalAmount { get; set; }
        public string PaymentTransactionId { get; set; } = string.Empty;
        
        // == НОВЫЕ ПОЛЯ ==
        public string UserPhone { get; set; } = string.Empty;
        public string UserAddress { get; set; } = string.Empty;
        // ================

        public ICollection<SubOrder> SubOrders { get; set; } = new List<SubOrder>();
    }
}