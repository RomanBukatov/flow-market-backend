namespace FlowMarket.Application.Shops.Dto
{
    public class ShopStatsDto
    {
        public decimal TotalRevenue { get; set; } // Выручка
        public int TotalOrders { get; set; }      // Всего заказов
        public int CompletedOrders { get; set; }  // Выполнено
        public decimal AverageCheck { get; set; } // Средний чек
    }
}