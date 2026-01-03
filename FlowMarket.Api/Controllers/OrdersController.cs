using System.Security.Claims;
using FlowMarket.Application.Orders.Dto;
using FlowMarket.Application.Orders.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace FlowMarket.Api.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class OrdersController : ControllerBase
    {
        private readonly IOrderService _orderService;

        public OrdersController(IOrderService orderService)
        {
            _orderService = orderService;
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

    }
}