using System.Security.Claims;
using FlowMarket.Application.Orders.Dto;
using FlowMarket.Application.Orders.Interfaces;
using FlowMarket.Domain.Entities.Orders;
using FlowMarket.Infrastructure.Persistence;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace FlowMarket.Api.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class OrdersController : ControllerBase
    {
        private readonly IOrderService _orderService;
        private readonly AppDbContext _context;

        public OrdersController(IOrderService orderService, AppDbContext context)
        {
            _orderService = orderService;
            _context = context;
        }

        private Guid GetCurrentUserId()
        {
            var userIdString = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (string.IsNullOrEmpty(userIdString)) throw new UnauthorizedAccessException("User not authenticated");
            return Guid.Parse(userIdString);
        }

        [HttpGet("seller")]
        [Authorize] // Только для залогиненных
        public async Task<IActionResult> GetSellerOrders()
        {
            var userIdString = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (string.IsNullOrEmpty(userIdString)) return Unauthorized();
            
            var userId = Guid.Parse(userIdString);
            
            var orders = await _orderService.GetSellerOrdersAsync(userId);
            return Ok(orders);
        }

        // POST: api/orders
        [HttpPost]
        [AllowAnonymous] // Разрешаем гостям
        public async Task<IActionResult> CreateOrder(CreateOrderDto dto)
        {
            try
            {
                // Пытаемся достать ID юзера, если он залогинен
                Guid? userId = null;
                var userIdString = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
                
                if (!string.IsNullOrEmpty(userIdString) && Guid.TryParse(userIdString, out var parsedId))
                {
                    userId = parsedId;
                }

                var result = await _orderService.CreateOrderAsync(dto, userId);
                return Ok(result);
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpPut("{subOrderId}/status")]
        [Authorize]
        public async Task<IActionResult> UpdateStatus(Guid subOrderId, [FromBody] UpdateOrderStatusDto dto)
        {
            try
            {
                var userIdString = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
                if (string.IsNullOrEmpty(userIdString)) return Unauthorized();
                var userId = Guid.Parse(userIdString);

                await _orderService.ChangeOrderStatusAsync(subOrderId, dto.Status, userId);
                return Ok(new { message = "Статус обновлен" });
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpGet("my-history")]
        [Authorize]
        public async Task<IActionResult> GetMyHistory()
        {
            var userIdString = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (string.IsNullOrEmpty(userIdString)) return Unauthorized();

            var orders = await _orderService.GetBuyerOrdersAsync(Guid.Parse(userIdString));
            return Ok(orders);
        }

        [HttpGet("{orderId}")]
        [Authorize]
        public async Task<IActionResult> GetOrderDetails(Guid orderId)
        {
            var userId = GetCurrentUserId();

            var order = await _context.Orders
                .Include(o => o.SubOrders).ThenInclude(so => so.Items).ThenInclude(i => i.Product)
                .FirstOrDefaultAsync(o => o.Id == orderId && o.BuyerId == userId);

            if (order == null) return NotFound("Заказ не найден");

            // СОБИРАЕМ ВСЕ ТОВАРЫ ИЗ ВСЕХ ПОДЗАКАЗОВ В ОДИН СПИСОК
            var allItems = order.SubOrders
                .SelectMany(so => so.Items)
                .Select(i => new
                {
                    // И тут берем из OrderItem
                    ProductName = i.ProductName,
                    Quantity = i.Quantity,
                    Price = i.Price,
                    ImageUrl = i.ProductImageUrl
                })
                .ToList();

            // Определяем общий статус (если все завершены - Completed, иначе В работе)
            var status = order.SubOrders.All(so => so.Status == OrderStatus.Completed)
                ? "Completed"
                : "In Progress";

            // Возвращаем структуру, которую ждет Фронтенд (OrderDetails interface)
            var result = new
            {
                OrderId = order.Id,
                SubOrderId = order.SubOrders.FirstOrDefault()?.Id, // Просто для совместимости
                CreatedAt = order.CreatedAt,
                Status = status,
                UserPhone = order.UserPhone,
                UserAddress = order.UserAddress,
                TotalPrice = order.TotalAmount,
                Items = allItems // <--- ТЕПЕРЬ ТУТ БУДУТ ТОВАРЫ
            };

            return Ok(result);
        }

    }
}