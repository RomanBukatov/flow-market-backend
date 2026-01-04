using FlowMarket.Application.Payments.Interfaces;
using Microsoft.Extensions.Configuration; // <--- Добавь

namespace FlowMarket.Infrastructure.Services.Payments
{
    public class MockPaymentGateway : IPaymentGateway
    {
        private readonly string _baseUrl;

        // Внедряем конфиг
        public MockPaymentGateway(IConfiguration configuration)
        {
            // Берем адрес из настроек. Если нет - по дефолту localhost
            _baseUrl = configuration["AppUrl"] ?? "http://localhost:5009";
        }

        public Task<string> CreatePaymentLinkAsync(Guid orderId, decimal amount, string description)
        {
            // Формируем ссылку динамически
            return Task.FromResult($"{_baseUrl}/fake-pay/{orderId}");
        }

        public Task<bool> CheckPaymentStatusAsync(string transactionId)
        {
            return Task.FromResult(true);
        }
    }
}