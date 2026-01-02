using System;
using System.Threading.Tasks;

namespace FlowMarket.Application.Payments.Interfaces;

public interface IPaymentGateway
{
    Task<string> CreatePaymentLinkAsync(Guid orderId, decimal amount, string description);
    Task<bool> CheckPaymentStatusAsync(string transactionId);
}