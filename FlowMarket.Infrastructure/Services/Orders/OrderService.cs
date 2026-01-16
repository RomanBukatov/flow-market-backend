using FlowMarket.Application.Common.Interfaces;
using FlowMarket.Application.Orders.Dto;
using FlowMarket.Application.Orders.Interfaces;
using FlowMarket.Application.Payments.Interfaces;
using FlowMarket.Application.Shops.Interfaces;
using FlowMarket.Application.Shops.Dto;
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
        private readonly IDeliveryZoneService _deliveryService; // <--- Новое поле

        // 2. Внедрили через конструктор
        public OrderService(
            AppDbContext context,
            IPaymentGateway paymentGateway,
            INotificationService notificationService,
            IDeliveryZoneService deliveryService) // <--- Внедряем
        {
            _context = context;
            _paymentGateway = paymentGateway;
            _notificationService = notificationService;
            _deliveryService = deliveryService; // <--- Присваиваем
        }

        public async Task<List<SellerOrderDto>> GetSellerOrdersAsync(Guid userId)
        {
            var subOrders = await _context.SubOrders
                .Include(so => so.Order)
                .Include(so => so.Shop)
                .Include(so => so.Items).ThenInclude(i => i.Product)
                .AsNoTracking()
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
                    // Берем из OrderItem (Снэпшот), а не из i.Product
                    ProductName = i.ProductName,
                    Quantity = i.Quantity,
                    Price = i.Price,
                    TotalPrice = i.Quantity * i.Price,
                    ImageUrl = i.ProductImageUrl // <--- Берем сохраненную картинку
                }).ToList()
            }).ToList();

            return result;
        }

        public async Task ChangeOrderStatusAsync(Guid subOrderId, OrderStatus newStatus, Guid userId)
        {
            var subOrder = await _context.SubOrders
                .Include(so => so.Shop)
                .Include(so => so.Order) // <-- Важно: грузим родительский заказ
                .ThenInclude(o => o.Buyer) // <-- Важно: и покупателя
                .FirstOrDefaultAsync(so => so.Id == subOrderId);

            if (subOrder == null) throw new Exception("Заказ не найден");
            if (subOrder.Shop.OwnerId != userId) throw new Exception("Нет прав");

            // ЛОГИКА БОНУСОВ
            // Если статус меняется на Completed (и раньше не был Completed)
            if (newStatus == OrderStatus.Completed && subOrder.Status != OrderStatus.Completed)
            {
                // Проверяем, есть ли зарегистрированный покупатель
                if (subOrder.Order.Buyer != null)
                {
                    // Начисляем 5% от суммы подзаказа (ShopAmount + Commission, то есть полной цены товаров этого селлера)
                    // ShopAmount это 80%, значит полная цена = ShopAmount / 0.8
                    // Или проще: возьмем сумму товаров из Items, но лениво считать.
                    // Грубо: (ShopAmount + PlatformCommission) * 0.05

                    var fullPrice = subOrder.ShopAmount + subOrder.PlatformCommission;
                    var bonus = fullPrice * 0.05m; // 5%

                    subOrder.Order.Buyer.BonusBalance += bonus;
                }
            }

            subOrder.Status = newStatus;
            await _context.SaveChangesAsync();
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
                TotalAmount = 0, // Сначала 0
                PaymentTransactionId = string.Empty,
                // Status по дефолту New (из-за инициализации в классе или дефолтного значения enum),
                // но лучше явно не задавать, если не уверены
            };

            _context.Orders.Add(order);

            // 4. Группировка по магазинам (Создаем SubOrders)
            var productsByShop = products.GroupBy(p => p.ShopId);

            decimal finalTotalAmount = 0;

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
                        Price = product.BasePrice, // Цена на момент покупки

                        // == СОХРАНЯЕМ СНЭПШОТ ==
                        ProductName = product.Name,       // Сохраняем имя навсегда
                        ProductImageUrl = product.ImageUrl // Сохраняем картинку навсегда
                    };
                    currentSubOrderItems.Add(orderItem);
                }

                // РАСЧЕТ ДОСТАВКИ
                decimal deliveryPrice = 0;
                try
                {
                    // Вызываем наш калькулятор
                    deliveryPrice = await _deliveryService.CalculateDeliveryPriceAsync(new CalculateDeliveryDto
                    {
                        ShopId = shopGroup.Key,
                        UserLatitude = dto.UserLatitude,
                        UserLongitude = dto.UserLongitude,
                        OrderTotalAmount = shopTotal
                    });
                }
                catch
                {
                    // Если адрес вне зоны - можно либо кидать ошибку, либо ставить какую-то дефолтную цену
                    // Для MVP, если не смогли посчитать (например, координаты 0,0), ставим 0 или фиксированную
                    deliveryPrice = 0;
                }

                var subOrder = new SubOrder
                {
                    Order = order,
                    ShopId = shopGroup.Key,
                    Status = OrderStatus.New,
                    PlatformCommission = shopTotal * 0.20m,
                    ShopAmount = (shopTotal * 0.80m) + deliveryPrice,
                    Items = currentSubOrderItems
                };

                finalTotalAmount += shopTotal + deliveryPrice; // Накапливаем итого
                _context.SubOrders.Add(subOrder);
            }

            // ФИНАЛ: Обновляем сумму в главном заказе
            order.TotalAmount = finalTotalAmount;

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

        public async Task<List<BuyerOrderDto>> GetBuyerOrdersAsync(Guid buyerId)
        {
            var orders = await _context.Orders
                .Include(o => o.SubOrders) // Грузим подзаказы, чтобы понять статус
                .AsNoTracking()
                .Where(o => o.BuyerId == buyerId)
                .OrderByDescending(o => o.CreatedAt)
                .ToListAsync();

            return orders.Select(o => new BuyerOrderDto
            {
                OrderId = o.Id,
                CreatedAt = o.CreatedAt,
                TotalAmount = o.TotalAmount,
                // Простая логика: если все подзаказы завершены - Completed, иначе In Progress
                StatusSummary = o.SubOrders.All(so => so.Status == OrderStatus.Completed)
                    ? "Выполнен"
                    : "В работе"
            }).ToList();
        }
    }
}