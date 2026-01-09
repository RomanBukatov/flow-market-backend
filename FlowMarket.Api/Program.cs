using Scalar.AspNetCore;
using Microsoft.EntityFrameworkCore;
using System.Text.Json.Serialization;
using FlowMarket.Application.Catalog.Interfaces;
using FlowMarket.Infrastructure.Services;
using FlowMarket.Infrastructure.Persistence;
using FlowMarket.Infrastructure.Persistence.Seeding;
using FlowMarket.Application.Common.Mappings;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.IdentityModel.Tokens;
using System.Text;
using FlowMarket.Application.Auth.Interfaces;
using FlowMarket.Infrastructure.DependencyInjection;
using FlowMarket.Infrastructure.Services.Auth;

Console.OutputEncoding = System.Text.Encoding.UTF8;
System.Text.Encoding.RegisterProvider(System.Text.CodePagesEncodingProvider.Instance);

var builder = WebApplication.CreateBuilder(args);

// --- СЕРВИСЫ ---
builder.Services.AddControllers()
    .AddJsonOptions(options =>
    {
        options.JsonSerializerOptions.ReferenceHandler = ReferenceHandler.IgnoreCycles;
    });
builder.Services.AddEndpointsApiExplorer();

// БД и Сервисы
builder.Services.AddDbContext<AppDbContext>(options =>
     options.UseNpgsql(builder.Configuration.GetConnectionString("DefaultConnection")));
builder.Services.AddScoped<IProductImportService, ProductImportService>();
builder.Services.AddScoped<IAuthService, AuthService>();
builder.Services.AddInfrastructureServices(builder.Configuration);
builder.Services.AddAutoMapper(typeof(MappingProfile).Assembly);

// JWT AUTH (Это оставляем, это работает и нужно)
builder.Services.AddAuthentication(options =>
{
    options.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
    options.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
})
.AddJwtBearer(options =>
{
    // Безопасное получение ключа (чтобы не падало с null)
    var key = builder.Configuration["JwtSettings:Key"] ?? "DEV_KEY_ONLY_FOR_LOCALHOST_DONT_USE_IN_PROD_12345";
    var issuer = builder.Configuration["JwtSettings:Issuer"];
    var audience = builder.Configuration["JwtSettings:Audience"];

    options.TokenValidationParameters = new TokenValidationParameters
    {
        ValidateIssuer = true,
        ValidateAudience = true,
        ValidateLifetime = true,
        ValidateIssuerSigningKey = true,
        ValidIssuer = issuer,
        ValidAudience = audience,
        IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(key))
    };
});

builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowAll", policy =>
    {
        policy.AllowAnyOrigin()  // Разрешаем всем (для разработки)
              .AllowAnyMethod()  // GET, POST, PUT, DELETE...
              .AllowAnyHeader(); // Любые заголовки
    });
});

// OPENAPI (Простая версия, БЕЗ трансформеров, которые ломают сборку)
builder.Services.AddOpenApi();

var app = builder.Build();

// --- ПАЙПЛАЙН ---
if (app.Environment.IsDevelopment())
{
    app.MapOpenApi();
    app.MapScalarApiReference(options =>
    {
        options
            .WithTitle("MarioFlowers API")
            .WithTheme(ScalarTheme.DeepSpace)
            .WithDefaultHttpClient(ScalarTarget.CSharp, ScalarClient.HttpClient);
    });
}

// app.UseHttpsRedirection(); // Выключено для VPS

app.UseCors("AllowAll");
app.UseAuthentication();
app.UseAuthorization();
app.UseStaticFiles();
app.MapControllers();

// МИГРАЦИИ И СИДИНГ
using (var scope = app.Services.CreateScope())
{
    var context = scope.ServiceProvider.GetRequiredService<AppDbContext>();
    context.Database.Migrate(); 
    await DbInitializer.SeedAsync(context);
}

app.Run();