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
    public class DeliveryZonesController : ControllerBase
    {
        private readonly IDeliveryZoneService _zoneService;

        public DeliveryZonesController(IDeliveryZoneService zoneService)
        {
            _zoneService = zoneService;
        }

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

        [HttpGet]
        public async Task<IActionResult> GetMyZones()
        {
            var userId = GetCurrentUserId();
            var result = await _zoneService.GetMyZonesAsync(userId);
            return Ok(result);
        }

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

        [HttpPost("calculate")]
        [AllowAnonymous]
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