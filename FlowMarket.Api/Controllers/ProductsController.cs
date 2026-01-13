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

        // GET: api/products
        [HttpGet]
        [AllowAnonymous]
        public async Task<IActionResult> GetProducts(
            [FromQuery] int page = 1,
            [FromQuery] int pageSize = 48,
            [FromQuery] ProductFilterDto filter = null) // <--- Добавили фильтр
        {
            var query = _context.Products
                                .Include(p => p.Shop)
                                .Where(p => !p.IsDeleted)
                                .AsQueryable();

            // === ЛОГИКА ФИЛЬТРАЦИИ ===
            if (filter != null)
            {
                // Цена
                if (filter.MinPrice.HasValue)
                    query = query.Where(p => p.BasePrice >= filter.MinPrice.Value);

                if (filter.MaxPrice.HasValue)
                    query = query.Where(p => p.BasePrice <= filter.MaxPrice.Value);

                // Цвет (точное совпадение или частичное)
                if (!string.IsNullOrEmpty(filter.Color) && filter.Color != "Все")
                    query = query.Where(p => p.Color == filter.Color);

                // Время сборки (все, что быстрее или равно)
                if (filter.MaxAssemblyTime.HasValue)
                    query = query.Where(p => p.AssemblyTimeMinutes <= filter.MaxAssemblyTime.Value);

                // Поиск по имени
                if (!string.IsNullOrEmpty(filter.Search))
                    query = query.Where(p => p.Name.ToLower().Contains(filter.Search.ToLower()));
    
                // Фильтр по Магазину
                if (filter.ShopId.HasValue)
                    query = query.Where(p => p.ShopId == filter.ShopId.Value);
    
                // Фильтр по Поводу
                if (!string.IsNullOrEmpty(filter.Occasion) && filter.Occasion != "Все")
                    query = query.Where(p => p.Occasion == filter.Occasion);

                // Фильтр "Собран сегодня"
                if (filter.IsDailyOffer.HasValue && filter.IsDailyOffer.Value)
                {
                    query = query.Where(p => p.IsDailyOffer);
                }
            }

            // Сортировка и пагинация
            var totalCount = await query.CountAsync();

            var products = await query
                                .OrderByDescending(p => p.CreatedAt)
                                .Skip((page - 1) * pageSize)
                                .Take(pageSize)
                                .ToListAsync();

            var productsDto = _mapper.Map<List<ProductDto>>(products);
            var result = new PagedResult<ProductDto>(productsDto, totalCount, page, pageSize);

            return Ok(result);
        }

        // GET: api/products/{id}
        [HttpGet("{id}")]
        [AllowAnonymous]
        public async Task<IActionResult> GetProductById(Guid id)
        {
            var product = await _context.Products
                                        .Include(p => p.Shop) // Грузим магазин
                                        .FirstOrDefaultAsync(p => p.Id == id);
        
            if (product == null || product.IsDeleted)
                return NotFound(new { message = "Товар не найден" });
        
            var dto = _mapper.Map<ProductDto>(product);
            return Ok(dto);
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

        // PUT: api/products/{id}
        // Только для Владельца (обновление)
        [HttpPut("{id}")]
        [Authorize]
        public async Task<IActionResult> UpdateProduct(Guid id, UpdateProductDto dto)
        {
            try
            {
                var userId = GetCurrentUserId();
                var result = await _productService.UpdateProductAsync(id, dto, userId);
                return Ok(result);
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