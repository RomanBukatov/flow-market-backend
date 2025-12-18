using Scalar.AspNetCore;
using Microsoft.EntityFrameworkCore;
using System.Text.Json.Serialization;
using FlowMarket.Application.Catalog.Interfaces;
using FlowMarket.Infrastructure.Services;
using FlowMarket.Infrastructure.Persistence;
using FlowMarket.Infrastructure.Persistence.Seeding;
using FlowMarket.Application.Common.Mappings;

// Исправляем кодировку
Console.OutputEncoding = System.Text.Encoding.UTF8;
// Регистрируем провайдер кодировок (для поддержки Windows-1251 в Excel)
System.Text.Encoding.RegisterProvider(System.Text.CodePagesEncodingProvider.Instance);

var builder = WebApplication.CreateBuilder(args);

// 1. Добавляем сервисы
builder.Services.AddControllers()
    .AddJsonOptions(options =>
    {
        // Игнорируем циклические ссылки при сериализации
        options.JsonSerializerOptions.ReferenceHandler = ReferenceHandler.IgnoreCycles;
    });
builder.Services.AddEndpointsApiExplorer();

// ПОДКЛЮЧЕНИЕ БД (PostgreSQL)
builder.Services.AddDbContext<AppDbContext>(options =>
    options.UseNpgsql(builder.Configuration.GetConnectionString("DefaultConnection")));
builder.Services.AddScoped<IProductImportService, ProductImportService>();
builder.Services.AddAutoMapper(typeof(MappingProfile).Assembly);

// НАСТРОЙКА OPENAPI (МЕТАДАННЫЕ)
builder.Services.AddOpenApi(options =>
{
    options.AddDocumentTransformer((document, context, cancellationToken) =>
    {
        document.Info = new()
        {
            Title = "MarioFlowers API",
            Version = "v1",
            Description = "Backend API для маркетплейса цветов и подарков (MarioFlowers)."
        };
        return Task.CompletedTask;
    });
});

var app = builder.Build();

// 2. Настраиваем пайплайн
if (app.Environment.IsDevelopment())
{
    app.MapOpenApi();
    
    // Настройка Scalar UI
    app.MapScalarApiReference(options =>
    {
        options
            .WithTitle("MarioFlowers Docs")
            .WithTheme(ScalarTheme.DeepSpace)
            .WithDefaultHttpClient(ScalarTarget.CSharp, ScalarClient.HttpClient);
    });
}

//app.UseHttpsRedirection();
app.UseAuthorization();
app.MapControllers();

// АВТО-ЗАПОЛНЕНИЕ БАЗЫ (SEEDING)
using (var scope = app.Services.CreateScope())
{
    var context = scope.ServiceProvider.GetRequiredService<AppDbContext>();
    await DbInitializer.SeedAsync(context);
}

app.Run();