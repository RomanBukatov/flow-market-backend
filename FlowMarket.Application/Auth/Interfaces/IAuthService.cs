using System.Threading.Tasks;
using FlowMarket.Application.Auth.Dto;

namespace FlowMarket.Application.Auth.Interfaces
{
    public interface IAuthService
    {
        Task<AuthResponseDto> RegisterAsync(RegisterDto dto);
        Task<AuthResponseDto> LoginAsync(LoginDto dto);
    }
}