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
        [Authorize]
        public async Task<IActionResult> GetSellerOrders()
        {
            var userIdString = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (string.IsNullOrEmpty(userIdString)) return Unauthorized();

            var userId = Guid.Parse(userIdString);

            var orders = await _orderService.GetSellerOrdersAsync(userId);
            return Ok(orders);
        }

        [HttpPost]
        [AllowAnonymous]
        public async Task<IActionResult> CreateOrder(CreateOrderDto dto)
        {
            try
            {
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
                .AsNoTracking()
                .FirstOrDefaultAsync(o => o.Id == orderId && o.BuyerId == userId);

            if (order == null) return NotFound("Заказ не найден");

            var allItems = order.SubOrders
                .SelectMany(so => so.Items)
                .Select(i => new
                {
                    ProductName = i.ProductName,
                    Quantity = i.Quantity,
                    Price = i.Price,
                    ImageUrl = i.ProductImageUrl
                })
                .ToList();

            var status = order.SubOrders.All(so => so.Status == OrderStatus.Completed)
                ? "Completed"
                : "In Progress";

            var result = new
            {
                OrderId = order.Id,
                SubOrderId = order.SubOrders.FirstOrDefault()?.Id,
                CreatedAt = order.CreatedAt,
                Status = status,
                UserPhone = order.UserPhone,
                UserAddress = order.UserAddress,
                TotalPrice = order.TotalAmount,
                Items = allItems
            };

            return Ok(result);
        }

    }
}