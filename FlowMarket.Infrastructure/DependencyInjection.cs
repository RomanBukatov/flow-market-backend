using FlowMarket.Application.Shops.Interfaces;
using FlowMarket.Application.Products.Interfaces;
using FlowMarket.Application.Orders.Interfaces;
using FlowMarket.Infrastructure.Services.Shops;
using FlowMarket.Infrastructure.Services.Products;
using FlowMarket.Infrastructure.Services.Orders;
using FlowMarket.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;

namespace FlowMarket.Infrastructure.DependencyInjection
{
    public static class DependencyInjection
    {
        public static IServiceCollection AddInfrastructureServices(this IServiceCollection services, IConfiguration configuration)
        {
            // Регистрируем DbContext
            services.AddDbContext<AppDbContext>(options =>
                options.UseNpgsql(configuration.GetConnectionString("DefaultConnection")));

            // Сервисы
            services.AddScoped<IShopService, ShopService>();
            services.AddScoped<IProductManagementService, ProductManagementService>();
            services.AddScoped<IOrderService, OrderService>();

            return services;
        }
    }
}