using System.Security.Claims;
using FlowMarket.Application.Shops.Dto;
using FlowMarket.Application.Shops.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace FlowMarket.Api.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize] // Только для Селлеров
    public class DeliveryZonesController : ControllerBase
    {
        private readonly IDeliveryZoneService _zoneService;

        public DeliveryZonesController(IDeliveryZoneService zoneService)
        {
            _zoneService = zoneService;
        }

        // POST: api/DeliveryZones (Создать зону)
        [HttpPost]
        public async Task<IActionResult> CreateZone(CreateDeliveryZoneDto dto)
        {
            try
            {
                var userId = GetCurrentUserId();
                var result = await _zoneService.CreateZoneAsync(dto, userId);
                return Ok(result);
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        // GET: api/DeliveryZones (Мои зоны)
        [HttpGet]
        public async Task<IActionResult> GetMyZones()
        {
            var userId = GetCurrentUserId();
            var result = await _zoneService.GetMyZonesAsync(userId);
            return Ok(result);
        }

        // DELETE: api/DeliveryZones/{id}
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteZone(Guid id)
        {
            try
            {
                var userId = GetCurrentUserId();
                await _zoneService.DeleteZoneAsync(id, userId);
                return Ok(new { message = "Зона удалена" });
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        // POST: api/DeliveryZones/calculate
        [HttpPost("calculate")]
        [AllowAnonymous] // Покупателю не обязательно логиниться, чтобы узнать цену
        public async Task<IActionResult> CalculateDelivery(CalculateDeliveryDto dto)
        {
            try
            {
                var price = await _zoneService.CalculateDeliveryPriceAsync(dto);
                return Ok(new { price = price, message = "Доставка возможна" });
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        private Guid GetCurrentUserId()
        {
            var id = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (string.IsNullOrEmpty(id)) throw new UnauthorizedAccessException();
            return Guid.Parse(id);
        }
    }
}