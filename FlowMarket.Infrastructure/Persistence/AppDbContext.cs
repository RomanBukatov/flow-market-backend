using Microsoft.EntityFrameworkCore;
using FlowMarket.Domain.Entities.Users;
using FlowMarket.Domain.Entities.Shops;
using FlowMarket.Domain.Entities.Orders;
using FlowMarket.Domain.Entities.Products;

namespace FlowMarket.Infrastructure.Persistence
{
    public class AppDbContext : DbContext
    {
        public AppDbContext(DbContextOptions<AppDbContext> options) : base(options) { }

        public DbSet<AppUser> AppUsers { get; set; }
        public DbSet<Shop> Shops { get; set; }
        public DbSet<DeliveryZone> DeliveryZones { get; set; }
        public DbSet<Product> Products { get; set; }
        public DbSet<Order> Orders { get; set; }
        public DbSet<SubOrder> SubOrders { get; set; }
        public DbSet<OrderItem> OrderItems { get; set; }

        protected override void OnModelCreating(ModelBuilder builder)
        {
            base.OnModelCreating(builder);

            // Связь 1-ко-многим Order -> SubOrders
            builder.Entity<Order>()
                .HasMany(o => o.SubOrders)
                .WithOne(s => s.Order)
                .HasForeignKey(s => s.OrderId);

            // Связь 1-ко-многим SubOrder -> OrderItems
            builder.Entity<SubOrder>()
                .HasMany(s => s.Items)
                .WithOne()
                .HasForeignKey(oi => oi.SubOrderId);

            // Настройка типа для DeliveryZone Price
            builder.Entity<DeliveryZone>()
                .Property(dz => dz.Price)
                .HasColumnType("decimal(18,2)");
        }
    }
}