using System;
using System.Threading.Tasks;
using FlowMarket.Application.Common.Interfaces;
using Microsoft.Extensions.Logging;

namespace FlowMarket.Infrastructure.Services.Notifications
{
    public class ConsoleNotificationService : INotificationService
    {
        private readonly ILogger<ConsoleNotificationService> _logger;

        public ConsoleNotificationService(ILogger<ConsoleNotificationService> logger)
        {
            _logger = logger;
        }

        public Task SendOrderCreatedNotificationAsync(Guid orderId, string phone, decimal amount)
        {
            // ИМИТАЦИЯ ОТПРАВКИ В ОЧЕРЕДЬ
            // Когда будет RabbitMQ, тут будет: _bus.Publish(new OrderCreatedEvent(...));

            _logger.LogInformation($"[RabbitMQ STUB] >>> Отправка СМС на {phone}: 'Ваш заказ {orderId} на сумму {amount} принят!'");

            return Task.CompletedTask;
        }
    }
}