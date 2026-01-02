using System;
using System.Threading.Tasks;
using FlowMarket.Application.Payments.Interfaces;

namespace FlowMarket.Infrastructure.Services.Payments;

public class MockPaymentGateway : IPaymentGateway
{
    public Task<string> CreatePaymentLinkAsync(Guid orderId, decimal amount, string description)
    {
        // Возвращаем фейковую ссылку на оплату
        return Task.FromResult("http://localhost:5009/fake-pay/" + orderId);
    }

    public Task<bool> CheckPaymentStatusAsync(string transactionId)
    {
        // Всегда возвращаем true для заглушки
        return Task.FromResult(true);
    }
}