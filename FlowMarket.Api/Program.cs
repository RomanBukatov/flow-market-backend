using Scalar.AspNetCore;
using Microsoft.EntityFrameworkCore;
using FlowMarket.Infrastructure.Persistence;

// Исправляем кодировку консоли
Console.OutputEncoding = System.Text.Encoding.UTF8;

var builder = WebApplication.CreateBuilder(args);

// 1. Добавляем сервисы
builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();

// ПОДКЛЮЧЕНИЕ БД (PostgreSQL)
builder.Services.AddDbContext<AppDbContext>(options =>
    options.UseNpgsql(builder.Configuration.GetConnectionString("DefaultConnection")));

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

app.UseHttpsRedirection();
app.UseAuthorization();
app.MapControllers();

app.Run();