using FlowMarket.Infrastructure.Persistence;
using FlowMarket.Domain.Entities.Users;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using FlowMarket.Application.Orders.Dto; // Для DTO заказов

namespace FlowMarket.Api.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    // ВАЖНО: Доступ только для роли Admin (у нас в Enum это 0, в JWT это строка "Admin")
    // Но лучше проверить в коде, чтобы наверняка.
    [Authorize] 
    public class AdminController : ControllerBase
    {
        private readonly AppDbContext _context;

        public AdminController(AppDbContext context)
        {
            _context = context;
        }

        // GET: api/admin/users
        [HttpGet("users")]
        public async Task<IActionResult> GetAllUsers()
        {
            // Проверка на админа (хардкорная)
            // В реале лучше через Policy, но для скорости так:
            var role = User.FindFirst(System.Security.Claims.ClaimTypes.Role)?.Value;
            if (role != "Admin" && role != "0") return Forbid();

            var users = await _context.AppUsers
                .AsNoTracking()
                .Select(u => new 
                {
                    u.Id,
                    u.FullName,
                    u.Email,
                    u.PhoneNumber,
                    Role = u.Role.ToString(),
                    u.CreatedAt
                })
                .ToListAsync();

            return Ok(users);
        }

        // GET: api/admin/orders
        [HttpGet("orders")]
        public async Task<IActionResult> GetAllOrders()
        {
            var role = User.FindFirst(System.Security.Claims.ClaimTypes.Role)?.Value;
            if (role != "Admin" && role != "0") return Forbid();

            // Берем ВСЕ заказы платформы
            var orders = await _context.Orders
                .Include(o => o.Buyer)
                .AsNoTracking()
                .OrderByDescending(o => o.CreatedAt)
                .Select(o => new 
                {
                    o.Id,
                    Date = o.CreatedAt,
                    Customer = o.Buyer.FullName ?? "Гость",
                    Phone = o.UserPhone,
                    Total = o.TotalAmount,
                    // Статус берем общий (упрощенно)
                    Status = o.SubOrders.All(s => s.Status == Domain.Entities.Orders.OrderStatus.Completed) ? "Completed" : "Active"
                })
                .ToListAsync();

            return Ok(orders);
        }
    }
}