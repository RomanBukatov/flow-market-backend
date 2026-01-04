namespace FlowMarket.Application.Orders.Dto
{
    public class BuyerOrderDto
    {
        public Guid OrderId { get; set; }
        public DateTime CreatedAt { get; set; }
        public decimal TotalAmount { get; set; }
        public string StatusSummary { get; set; } // Например: "В работе", "Частично доставлен"
        // Можно добавить список товаров, если нужно
    }
}