using FlowMarket.Infrastructure.Persistence;
using Marketplace.Domain.Entities.Users;
using Marketplace.Domain.Entities.Shops;
using Marketplace.Domain.Entities.Products;

namespace FlowMarket.Infrastructure.Persistence.Seeding
{
    public static class DbInitializer
    {
        public static async Task SeedAsync(AppDbContext context)
        {
            if (context.AppUsers.Any())
            {
                return;
            }

            // Создать пользователей
            var admin = new AppUser
            {
                FullName = "Admin User",
                PhoneNumber = "1234567890",
                Email = "admin@mario.ru",
                PasswordHash = "adminhash",
                Role = UserRole.Admin,
                BonusBalance = 0
            };

            var seller = new AppUser
            {
                FullName = "Seller User",
                PhoneNumber = "0987654321",
                Email = "seller@mario.ru",
                PasswordHash = "sellerhash",
                Role = UserRole.Seller,
                BonusBalance = 0
            };

            context.AppUsers.Add(admin);
            context.AppUsers.Add(seller);
            await context.SaveChangesAsync();

            // Создать магазин
            var shop = new Shop
            {
                Name = "MarioFlowers Main",
                Description = "Main flower shop",
                LogoUrl = "",
                Latitude = 0,
                Longitude = 0,
                PaymentVendorId = null,
                IsHolidayPricingEnabled = false,
                OwnerId = seller.Id
            };

            context.Shops.Add(shop);
            await context.SaveChangesAsync();

            // Создать DeliveryZone
            var deliveryZone = new DeliveryZone
            {
                ZoneName = "Main Zone",
                RadiusKm = 10,
                Price = 300,
                FreeDeliveryThreshold = null,
                ShopId = shop.Id
            };

            context.DeliveryZones.Add(deliveryZone);

            // Создать товары
            var product1 = new Product
            {
                Name = "101 Красная Роза",
                Description = "",
                BasePrice = 15000,
                HeightCm = 0,
                WidthCm = 0,
                AssemblyTimeMinutes = 30,
                Color = null,
                Occasion = null,
                IsDailyOffer = true,
                AutoHideAt = null,
                CompositionJson = "{}",
                ShopId = shop.Id
            };

            var product2 = new Product
            {
                Name = "Нежный Пион",
                Description = "",
                BasePrice = 4500,
                HeightCm = 0,
                WidthCm = 0,
                AssemblyTimeMinutes = 30,
                Color = null,
                Occasion = null,
                IsDailyOffer = false,
                AutoHideAt = null,
                CompositionJson = "{}",
                ShopId = shop.Id
            };

            var product3 = new Product
            {
                Name = "Сладкий набор (Клубника)",
                Description = "",
                BasePrice = 2000,
                HeightCm = 0,
                WidthCm = 0,
                AssemblyTimeMinutes = 30,
                Color = null,
                Occasion = null,
                IsDailyOffer = false,
                AutoHideAt = null,
                CompositionJson = "{}",
                ShopId = shop.Id
            };

            context.Products.AddRange(product1, product2, product3);

            await context.SaveChangesAsync();
        }
    }
}