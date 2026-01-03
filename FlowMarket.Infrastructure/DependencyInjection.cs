using FlowMarket.Application.Common.Interfaces;
using FlowMarket.Application.Orders.Interfaces;
using FlowMarket.Application.Payments.Interfaces;
using FlowMarket.Application.Products.Interfaces;
using FlowMarket.Application.Shops.Interfaces;
using FlowMarket.Infrastructure.Persistence;
using FlowMarket.Infrastructure.Services.Cache;
using FlowMarket.Infrastructure.Services.Notifications;
using FlowMarket.Infrastructure.Services.Orders;
using FlowMarket.Infrastructure.Services.Payments;
using FlowMarket.Infrastructure.Services.Products;
using FlowMarket.Infrastructure.Services.Shops;
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
            services.AddMemoryCache(); // Встроенный кэш .NET
            services.AddScoped<ICacheService, MemoryCacheService>(); // Наша обертка
            services.AddScoped<INotificationService, ConsoleNotificationService>();

            // РЕГИСТРАЦИЯ ОПЛАТЫ (Пока Mock, потом заменим на Real)
            services.AddScoped<IPaymentGateway, MockPaymentGateway>();

            return services;
        }
    }
}