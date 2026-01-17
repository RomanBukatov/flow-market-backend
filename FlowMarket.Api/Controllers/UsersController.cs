using System.Security.Claims;
using AutoMapper;
using FlowMarket.Application.Auth.Dto;
using FlowMarket.Infrastructure.Persistence;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace FlowMarket.Api.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class UsersController : ControllerBase
    {
        private readonly AppDbContext _context;
        private readonly IMapper _mapper;

        public UsersController(AppDbContext context, IMapper mapper)
        {
            _context = context;
            _mapper = mapper;
        }

        [HttpGet("me")]
        public async Task<IActionResult> GetMyProfile()
        {
            var userIdString = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (string.IsNullOrEmpty(userIdString)) return Unauthorized();

            var userId = Guid.Parse(userIdString);

            var user = await _context.AppUsers.FindAsync(userId);
            if (user == null) return NotFound("Пользователь не найден");

            var dto = _mapper.Map<UserProfileDto>(user);
            return Ok(dto);
        }

        [HttpPut("me")]
        public async Task<IActionResult> UpdateProfile(UpdateUserDto dto)
        {
            var userIdString = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (string.IsNullOrEmpty(userIdString)) return Unauthorized();
            var userId = Guid.Parse(userIdString);

            var user = await _context.AppUsers.FindAsync(userId);
            if (user == null) return NotFound();

            // Обновляем поля
            user.FullName = dto.FullName;
            user.PhoneNumber = dto.PhoneNumber;

            await _context.SaveChangesAsync();

            return Ok(_mapper.Map<UserProfileDto>(user));
        }
    }
}