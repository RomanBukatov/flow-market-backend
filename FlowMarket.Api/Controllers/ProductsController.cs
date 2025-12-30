using System.Security.Claims;
using AutoMapper;
using FlowMarket.Application.Catalog.Dto;
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
        // Открыт для всех (витрина)
        [HttpGet]
        [AllowAnonymous] 
        public async Task<IActionResult> GetProducts()
        {
            var products = await _context.Products
                                         .Include(p => p.Shop)
                                         .Where(p => !p.IsDeleted) // Не показываем удаленные!
                                         .OrderByDescending(p => p.CreatedAt) // Свежие сверху
                                         .ToListAsync();

            var productsDto = _mapper.Map<List<ProductDto>>(products);
            return Ok(productsDto);
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