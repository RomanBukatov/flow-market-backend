using System.Security.Claims;
using FlowMarket.Application.Shops.Dto;
using FlowMarket.Application.Shops.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace FlowMarket.Api.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class ShopsController : ControllerBase
    {
        private readonly IShopService _shopService;

        public ShopsController(IShopService shopService)
        {
            _shopService = shopService;
        }

        // Создать магазин
        [HttpPost]
        public async Task<IActionResult> CreateShop(CreateShopDto dto)
        {
            // Вытаскиваем ID пользователя из токена
            var userIdString = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (string.IsNullOrEmpty(userIdString)) return Unauthorized();

            var userId = Guid.Parse(userIdString);

            var result = await _shopService.CreateShopAsync(dto, userId);
            return Ok(result);
        }

        // Мои магазины
        [HttpGet("my")]
        public async Task<IActionResult> GetMyShops()
        {
            var userIdString = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (string.IsNullOrEmpty(userIdString)) return Unauthorized();

            var userId = Guid.Parse(userIdString);

            var result = await _shopService.GetUserShopsAsync(userId);
            return Ok(result);
        }

        // PUT: api/shops
        [HttpPut]
        public async Task<IActionResult> UpdateShop(UpdateShopDto dto)
        {
            var userIdString = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (string.IsNullOrEmpty(userIdString)) return Unauthorized();

            var userId = Guid.Parse(userIdString);

            try
            {
                var result = await _shopService.UpdateShopAsync(dto, userId);
                return Ok(result);
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        // GET: api/shops/{id}
        [HttpGet("{id}")]
        [AllowAnonymous] // Публичный доступ
        public async Task<IActionResult> GetShopById(Guid id)
        {
            var shop = await _shopService.GetShopByIdAsync(id);

            if (shop == null) return NotFound("Магазин не найден");

            return Ok(shop);
        }
    }
}