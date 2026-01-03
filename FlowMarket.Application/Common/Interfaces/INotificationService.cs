namespace FlowMarket.Application.Common.Interfaces
{
    public interface INotificationService
    {
        // Метод "выстрелил и забыл"
        Task SendOrderCreatedNotificationAsync(Guid orderId, string phone, decimal amount);
    }
}