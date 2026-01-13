using FlowMarket.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Logging;

namespace FlowMarket.Infrastructure.Services.Background
{
    public class ProductCleanupService : BackgroundService
    {
        private readonly IServiceProvider _serviceProvider;
        private readonly ILogger<ProductCleanupService> _logger;

        public ProductCleanupService(
            IServiceProvider serviceProvider, 
            ILogger<ProductCleanupService> logger)
        {
            _serviceProvider = serviceProvider;
            _logger = logger;
        }

        protected override async Task ExecuteAsync(CancellationToken stoppingToken)
        {
            _logger.LogInformation("🧹 [Cleanup Service] Робот-уборщик запущен.");

            while (!stoppingToken.IsCancellationRequested)
            {
                try
                {
                    await CleanOldProductsAsync();
                }
                catch (Exception ex)
                {
                    _logger.LogError(ex, "Ошибка при очистке старых товаров");
                }

                // Спим 1 час (или 1 минуту для теста)
                // TimeSpan.FromHours(1) для продакшена
                await Task.Delay(TimeSpan.FromMinutes(60), stoppingToken);
            }
        }

        private async Task CleanOldProductsAsync()
        {
            // BackgroundService - это синглтон, а DbContext - scoped.
            // Нужно создать временную область видимости.
            using (var scope = _serviceProvider.CreateScope())
            {
                var context = scope.ServiceProvider.GetRequiredService<AppDbContext>();

                // Логика: Найти товары "Собран сегодня", которые созданы больше 24 часов назад
                var deadline = DateTime.UtcNow.AddHours(-24);

                var oldProducts = await context.Products
                    .Where(p => !p.IsDeleted) // Живые
                    .Where(p => p.IsDailyOffer) // Категория "Собран сегодня"
                    .Where(p => p.CreatedAt < deadline) // Старые
                    .ToListAsync();

                if (oldProducts.Any())
                {
                    foreach (var product in oldProducts)
                    {
                        product.IsDeleted = true;
                        _logger.LogInformation($"🗑 Удален просроченный букет: {product.Name} (ID: {product.Id})");
                    }

                    await context.SaveChangesAsync();
                }
            }
        }
    }
}