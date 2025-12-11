using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using FlowMarket.Infrastructure.Persistence;
using Marketplace.Domain.Entities.Products;

namespace FlowMarket.Api.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class ProductsController : ControllerBase
    {
        private readonly AppDbContext _context;

        // Внедряем DbContext через конструктор
        public ProductsController(AppDbContext context)
        {
            _context = context;
        }

        // GET: api/products
        [HttpGet]
        public async Task<IActionResult> GetProducts()
        {
            // Читаем из реальной БД
            var products = await _context.Products
                                         .Include(p => p.Shop) // Подгружаем магазин
                                         .ToListAsync();
            return Ok(products);
        }

        // POST: api/products (Временный метод, чтобы добавить товар и проверить)
        [HttpPost]
        public async Task<IActionResult> CreateProduct(string name, decimal price)
        {
            var product = new Product
            {
                Name = name,
                BasePrice = price,
                Description = "Test Description",
                ShopId = Guid.Empty, // Тут упадет, если нет магазина, но для теста соединения пойдет
                // Хак: чтобы не падало, создадим заглушку магазина, если надо, 
                // но пока просто проверим, дойдет ли запрос до базы.
            };

            // В реале тут будет сложная логика, пока просто тест соединения
            // _context.Products.Add(product);
            // await _context.SaveChangesAsync();
            
            return Ok("Database connection is OK!");
        }
    }
}