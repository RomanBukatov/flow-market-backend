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

        [HttpGet]
        [AllowAnonymous]
        public async Task<IActionResult> GetProducts(
            [FromQuery] int page = 1,
            [FromQuery] int pageSize = 48,
            [FromQuery] ProductFilterDto filter = null)
        {
            var query = _context.Products
                                .Include(p => p.Shop)
                                .AsNoTracking()
                                .Where(p => !p.IsDeleted)
                                .AsQueryable();

            if (filter != null)
            {
                if (filter.MinPrice.HasValue)
                    query = query.Where(p => p.BasePrice >= filter.MinPrice.Value);

                if (filter.MaxPrice.HasValue)
                    query = query.Where(p => p.BasePrice <= filter.MaxPrice.Value);

                if (!string.IsNullOrEmpty(filter.Color) && filter.Color != "Все")
                    query = query.Where(p => p.Color == filter.Color);

                if (filter.MaxAssemblyTime.HasValue)
                    query = query.Where(p => p.AssemblyTimeMinutes <= filter.MaxAssemblyTime.Value);

                if (!string.IsNullOrEmpty(filter.Search))
                    query = query.Where(p => p.Name.ToLower().Contains(filter.Search.ToLower()));

                if (filter.ShopId.HasValue)
                    query = query.Where(p => p.ShopId == filter.ShopId.Value);

                if (!string.IsNullOrEmpty(filter.Occasion) && filter.Occasion != "Все")
                    query = query.Where(p => p.Occasion == filter.Occasion);

                if (!string.IsNullOrEmpty(filter.City) && filter.City != "Все города")
                    query = query.Where(p => p.Shop.City == filter.City);

                if (filter.IsDailyOffer.HasValue && filter.IsDailyOffer.Value)
                {
                    query = query.Where(p => p.IsDailyOffer);
                }

                if (filter.MinHeight.HasValue) query = query.Where(p => p.HeightCm >= filter.MinHeight.Value);
                if (filter.MaxHeight.HasValue) query = query.Where(p => p.HeightCm <= filter.MaxHeight.Value);
                if (filter.MinWidth.HasValue) query = query.Where(p => p.WidthCm >= filter.MinWidth.Value);
                if (filter.MaxWidth.HasValue) query = query.Where(p => p.WidthCm <= filter.MaxWidth.Value);
            }

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

        [HttpGet("{id}")]
        [AllowAnonymous]
        public async Task<IActionResult> GetProductById(Guid id)
        {
            var product = await _context.Products
                                        .Include(p => p.Shop)
                                        .AsNoTracking()
                                        .FirstOrDefaultAsync(p => p.Id == id);

            if (product == null || product.IsDeleted)
                return NotFound(new { message = "Товар не найден" });

            var dto = _mapper.Map<ProductDto>(product);
            return Ok(dto);
        }

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

        private Guid GetCurrentUserId()
        {
            var userIdString = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (string.IsNullOrEmpty(userIdString)) 
                throw new Exception("Не удалось определить пользователя");
            
            return Guid.Parse(userIdString);
        }
    }
}