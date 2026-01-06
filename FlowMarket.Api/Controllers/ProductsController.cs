using System.Security.Claims;
using AutoMapper;
using FlowMarket.Application.Catalog.Dto;
using FlowMarket.Application.Common.Models;
using FlowMarket.Application.Products.Interfaces;
using FlowMarket.Infrastructure.Persistence;
using FlowMarket.Domain.Entities.Products;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace FlowMarket.Api.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class ProductsController : ControllerBase
    {
        private readonly AppDbContext _context;
        private readonly IMapper _mapper;
        private readonly IProductManagementService _productService;

        public ProductsController(
            AppDbContext context, 
            IMapper mapper, 
            IProductManagementService productService)
        {
            _context = context;
            _mapper = mapper;
            _productService = productService;
        }

        // GET: api/products?page=1&pageSize=12
        [HttpGet]
        [AllowAnonymous] 
        public async Task<IActionResult> GetProducts([FromQuery] int page = 1, [FromQuery] int pageSize = 12)
        {
            // 1. Создаем запрос (еще не выполняем)
            var query = _context.Products
                                .Include(p => p.Shop)
                                .Where(p => !p.IsDeleted)
                                .OrderByDescending(p => p.CreatedAt)
                                .AsQueryable();

            // 2. Считаем общее количество (быстрый запрос COUNT)
            var totalCount = await query.CountAsync();

            // 3. Берем нужную страницу (LIMIT/OFFSET)
            var products = await query
                                .Skip((page - 1) * pageSize)
                                .Take(pageSize)
                                .ToListAsync();

            // 4. Маппим
            var productsDto = _mapper.Map<List<ProductDto>>(products);

            // 5. Возвращаем обертку
            var result = new PagedResult<ProductDto>(productsDto, totalCount, page, pageSize);
            
            return Ok(result);
        }

        // POST: api/products
        // Только для Селлеров (создание)
        [HttpPost]
        [Authorize] 
        public async Task<IActionResult> CreateProduct(CreateProductDto dto)
        {
            try
            {
                var userId = GetCurrentUserId();
                var result = await _productService.CreateProductAsync(dto, userId);
                return Ok(result);
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        // DELETE: api/products/{id}
        // Только для Владельца (удаление)
        [HttpDelete("{id}")]
        [Authorize]
        public async Task<IActionResult> DeleteProduct(Guid id)
        {
            try
            {
                var userId = GetCurrentUserId();
                await _productService.DeleteProductAsync(id, userId);
                return Ok(new { message = "Товар успешно удален (скрыт)" });
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        // Вспомогательный метод для получения ID из токена
        private Guid GetCurrentUserId()
        {
            var userIdString = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (string.IsNullOrEmpty(userIdString)) 
                throw new Exception("Не удалось определить пользователя");
            
            return Guid.Parse(userIdString);
        }
    }
}