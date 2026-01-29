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

        // GET: api/admin/products
        [HttpGet("products")]
        public async Task<IActionResult> GetAllProducts([FromQuery] int page = 1, [FromQuery] int pageSize = 20, [FromQuery] string? search = null)
        {
            var role = User.FindFirst(System.Security.Claims.ClaimTypes.Role)?.Value;
            if (role != "Admin" && role != "0") return Forbid();

            var query = _context.Products
                .Include(p => p.Shop) // Чтобы видеть продавца
                .AsNoTracking()
                .Where(p => !p.IsDeleted)
                .AsQueryable();

            if (!string.IsNullOrEmpty(search))
            {
                search = search.ToLower();
                query = query.Where(p => p.Name.ToLower().Contains(search) || p.Shop.Name.ToLower().Contains(search));
            }

            var totalCount = await query.CountAsync();
            var products = await query
                .OrderByDescending(p => p.CreatedAt)
                .Skip((page - 1) * pageSize)
                .Take(pageSize)
                .Select(p => new
                {
                    p.Id,
                    p.Name,
                    p.BasePrice,
                    p.ImageUrl,
                    ShopName = p.Shop.Name, // Важно: имя продавца
                    p.CreatedAt
                })
                .ToListAsync();

            return Ok(new { Items = products, TotalCount = totalCount });
        }

        // DELETE: api/admin/products/{id}
        [HttpDelete("products/{id}")]
        public async Task<IActionResult> ForceDeleteProduct(Guid id)
        {
            var role = User.FindFirst(System.Security.Claims.ClaimTypes.Role)?.Value;
            if (role != "Admin" && role != "0") return Forbid();

            var product = await _context.Products.FindAsync(id);
            if (product == null) return NotFound();

            product.IsDeleted = true; // Мягкое удаление
            await _context.SaveChangesAsync();

            return Ok(new { message = "Товар удален модератором." });
        }
    }
}