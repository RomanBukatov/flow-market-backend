using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using FlowMarket.Application.Orders.Dto;
using FlowMarket.Application.Orders.Interfaces;
using FlowMarket.Domain.Entities.Orders;
using FlowMarket.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;

namespace FlowMarket.Infrastructure.Services.Orders
{
    public class OrderService : IOrderService
    {
        private readonly AppDbContext _context;

        public OrderService(AppDbContext context)
        {
            _context = context;
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
                return product.BasePrice * item.Quantity; // Исправлено: BasePrice
            });

            // 3. Создаем ГЛАВНЫЙ ЗАКАЗ
            var order = new Order
            {
                BuyerId = userId, // Исправлено: BuyerId
                UserPhone = dto.UserPhone,
                UserAddress = dto.UserAddress,
                TotalAmount = totalAmount,
                PaymentTransactionId = string.Empty // Пока пусто, заполнится после оплаты
            };

            _context.Orders.Add(order); // Добавляем в контекст, чтобы сгенерировался ID

            // 4. Группировка по магазинам (Создаем SubOrders)
            var productsByShop = products.GroupBy(p => p.ShopId);

            foreach (var shopGroup in productsByShop)
            {
                // Считаем сумму конкретно для этого магазина
                decimal shopTotal = 0;
                var currentSubOrderItems = new List<OrderItem>();

                foreach (var product in shopGroup)
                {
                    var qty = dto.Items.First(i => i.ProductId == product.Id).Quantity;
                    shopTotal += product.BasePrice * qty;

                    // Создаем позицию
                    var orderItem = new OrderItem
                    {
                        ProductId = product.Id,
                        Quantity = qty,
                        Price = product.BasePrice
                        // SubOrderId привяжется автоматически EF Core при добавлении в коллекцию
                    };
                    currentSubOrderItems.Add(orderItem);
                }

                // Создаем ПОД-ЗАКАЗ
                var subOrder = new SubOrder
                {
                    Order = order, // Связь с родителем
                    ShopId = shopGroup.Key,
                    Status = OrderStatus.New, // Исправлено: Enum
                    
                    // СПЛИТ-ЛОГИКА (Хардкод 20%)
                    PlatformCommission = shopTotal * 0.20m,
                    ShopAmount = shopTotal * 0.80m,
                    
                    Items = currentSubOrderItems
                };

                _context.SubOrders.Add(subOrder);
            }

            // 5. Сохраняем всё одним махом (Транзакция)
            await _context.SaveChangesAsync();

            // 6. Возврат
            return new OrderResultDto
            {
                OrderId = order.Id,
                TotalAmount = order.TotalAmount,
                // Генерация ссылки на оплату (заглушка)
                PaymentLink = $"https://pay.marioflowers.ru/checkout?orderId={order.Id}"
            };
        }
    }
}