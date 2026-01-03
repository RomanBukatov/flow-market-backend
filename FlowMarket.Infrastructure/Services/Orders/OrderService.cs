using FlowMarket.Application.Common.Interfaces;
using FlowMarket.Application.Orders.Dto;
using FlowMarket.Application.Orders.Interfaces;
using FlowMarket.Application.Payments.Interfaces;
using FlowMarket.Domain.Entities.Orders;
using FlowMarket.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace FlowMarket.Infrastructure.Services.Orders
{
    public class OrderService : IOrderService
    {
        private readonly AppDbContext _context;
        private readonly IPaymentGateway _paymentGateway;
        private readonly INotificationService _notificationService; 

        // 2. Внедрили через конструктор
        public OrderService(
            AppDbContext context,
            IPaymentGateway paymentGateway,
            INotificationService notificationService)
        {
            _context = context;
            _paymentGateway = paymentGateway;
            _notificationService = notificationService;
        }

        public async Task<List<SellerOrderDto>> GetSellerOrdersAsync(Guid userId)
        {
            var subOrders = await _context.SubOrders
                .Include(so => so.Order)
                .Include(so => so.Shop)
                .Include(so => so.Items).ThenInclude(i => i.Product)
                .Where(so => so.Shop.OwnerId == userId)
                .ToListAsync();

            var result = subOrders.Select(so => new SellerOrderDto
            {
                SubOrderId = so.Id,
                OrderId = so.OrderId,
                CreatedAt = so.Order.CreatedAt,
                Status = so.Status.ToString(),
                UserPhone = so.Order.UserPhone,
                UserAddress = so.Order.UserAddress,
                TotalPrice = so.ShopAmount,
                Items = so.Items.Select(i => new SellerOrderItemDto
                {
                    ProductName = i.Product.Name,
                    Quantity = i.Quantity,
                    Price = i.Price,
                    TotalPrice = i.Quantity * i.Price,
                    ImageUrl = i.Product.ImageUrl
                }).ToList()
            }).ToList();

            return result;
        }

        public async Task<OrderResultDto> CreateOrderAsync(CreateOrderDto dto, Guid? userId)
        {
            // 1. Получаем товары из БД
            var productIds = dto.Items.Select(item => item.ProductId).ToList();
            var products = await _context.Products
                .Where(p => productIds.Contains(p.Id))
                .ToListAsync();

            if (products.Count != productIds.Count)
            {
                throw new Exception("Один или несколько товаров не найдены (возможно, удалены).");
            }

            // 2. Считаем общую сумму
            var totalAmount = dto.Items.Sum(item =>
            {
                var product = products.First(p => p.Id == item.ProductId);
                return product.BasePrice * item.Quantity;
            });

            // 3. Создаем ГЛАВНЫЙ ЗАКАЗ
            var order = new Order
            {
                BuyerId = userId,
                UserPhone = dto.UserPhone,
                UserAddress = dto.UserAddress,
                TotalAmount = totalAmount,
                PaymentTransactionId = string.Empty,
                // Status по дефолту New (из-за инициализации в классе или дефолтного значения enum),
                // но лучше явно не задавать, если не уверены
            };

            _context.Orders.Add(order);

            // 4. Группировка по магазинам (Создаем SubOrders)
            var productsByShop = products.GroupBy(p => p.ShopId);

            foreach (var shopGroup in productsByShop)
            {
                decimal shopTotal = 0;
                var currentSubOrderItems = new List<OrderItem>();

                foreach (var product in shopGroup)
                {
                    var qty = dto.Items.First(i => i.ProductId == product.Id).Quantity;
                    shopTotal += product.BasePrice * qty;

                    var orderItem = new OrderItem
                    {
                        ProductId = product.Id,
                        Quantity = qty,
                        Price = product.BasePrice
                    };
                    currentSubOrderItems.Add(orderItem);
                }

                var subOrder = new SubOrder
                {
                    Order = order,
                    ShopId = shopGroup.Key,
                    Status = OrderStatus.New,
                    PlatformCommission = shopTotal * 0.20m,
                    ShopAmount = shopTotal * 0.80m,
                    Items = currentSubOrderItems
                };

                _context.SubOrders.Add(subOrder);
            }

            // 5. Сохраняем
            await _context.SaveChangesAsync();

            // 6. ГЕНЕРАЦИЯ ССЫЛКИ
            string paymentUrl = await _paymentGateway.CreatePaymentLinkAsync(
                order.Id,
                order.TotalAmount,
                $"Заказ {order.Id} на FlowMarket"
            );

            // 7. УВЕДОМЛЕНИЕ
            await _notificationService.SendOrderCreatedNotificationAsync(order.Id, order.UserPhone, order.TotalAmount);

            return new OrderResultDto
            {
                OrderId = order.Id,
                TotalAmount = order.TotalAmount,
                PaymentLink = paymentUrl
            };
        }
    }
}