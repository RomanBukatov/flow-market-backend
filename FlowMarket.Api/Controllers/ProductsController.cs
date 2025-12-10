using Microsoft.AspNetCore.Mvc;

namespace FlowMarket.Api.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class ProductsController : ControllerBase
    {
        // GET: api/products
        [HttpGet]
        public IActionResult GetProducts()
        {
            // Возвращаем тестовые данные, чтобы показать клиенту структуру
            var products = new[]
            {
                new {
                    Id = Guid.NewGuid(),
                    Name = "Букет '101 Роза'",
                    Price = 15000,
                    IsDailyOffer = true, // Собран сегодня
                    ShopName = "MarioFlowers Main"
                },
                new {
                    Id = Guid.NewGuid(),
                    Name = "Торт 'Наполеон'",
                    Price = 2500,
                    IsDailyOffer = false,
                    ShopName = "Sweet Bakery"
                }
            };

            return Ok(products);
        }
    }
}