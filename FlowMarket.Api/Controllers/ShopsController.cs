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
    }
}