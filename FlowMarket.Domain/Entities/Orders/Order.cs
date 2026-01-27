using System.Collections.Generic;
using FlowMarket.Domain.Entities.Base;
using FlowMarket.Domain.Entities.Users;

namespace FlowMarket.Domain.Entities.Orders
{
    public enum OrderStatus
    {
        PendingPayment = 0, 
        Paid = 1,           
        Confirmed = 2,      
        Assembling = 3,
        PhotoReady = 4,
        Delivering = 5,
        Completed = 6,
        Cancelled = 7
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
        public decimal BonusesUsed { get; set; }
        public DateTime DeliveryDate { get; set; }
        public string DeliveryTimeSlot { get; set; } = string.Empty; // "09:00 - 12:00"
        // ================
        
        public ICollection<SubOrder> SubOrders { get; set; } = new List<SubOrder>();
    }
}