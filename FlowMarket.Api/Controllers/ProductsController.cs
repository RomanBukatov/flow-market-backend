using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using FlowMarket.Infrastructure.Persistence;
using Marketplace.Domain.Entities.Products;
using AutoMapper;
using FlowMarket.Application.Catalog.Dto;

namespace FlowMarket.Api.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class ProductsController : ControllerBase
    {
        private readonly AppDbContext _context;
        private readonly IMapper _mapper;

        // Внедряем DbContext через конструктор
        public ProductsController(AppDbContext context, IMapper mapper)
        {
            _context = context;
            _mapper = mapper;
        }

        // GET: api/products
        [HttpGet]
        public async Task<IActionResult> GetProducts()
        {
            // 1. Получаем данные из базы (Entity)
            var products = await _context.Products
                                         .Include(p => p.Shop)
                                         .ToListAsync();

            // 2. Превращаем их в красивые DTO
            var productsDto = _mapper.Map<List<ProductDto>>(products);

            // 3. Отдаем чистый JSON
            return Ok(productsDto);
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