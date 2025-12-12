using System.IO;
using System.Threading.Tasks;
using ExcelDataReader;
using FlowMarket.Application.Catalog.Interfaces; 
using Marketplace.Domain.Entities.Products; // <--- БЫЛО FlowMarket, СТАЛО Marketplace (как в твоих сущностях)
using FlowMarket.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;

namespace FlowMarket.Infrastructure.Services 
{
    public class ProductImportService : IProductImportService
    {
        private readonly AppDbContext _context;

        public ProductImportService(AppDbContext context)
        {
            _context = context;
        }

        public async Task<int> ImportFromExcelAsync(Stream fileStream, Guid shopId)
        {
            // Регистрируем кодировку ТУТ тоже, на всякий случай, если контекст потерялся
            System.Text.Encoding.RegisterProvider(System.Text.CodePagesEncodingProvider.Instance);
            
            using var reader = ExcelReaderFactory.CreateReader(fileStream);
            var dataSet = reader.AsDataSet();
            
            // Проверка на пустой файл
            if (dataSet.Tables.Count == 0) return 0;
            
            var dataTable = dataSet.Tables[0];
            int count = 0;

            for (int i = 1; i < dataTable.Rows.Count; i++) 
            {
                var row = dataTable.Rows[i];
                string name = row[0]?.ToString();
                if (string.IsNullOrWhiteSpace(name)) continue;

                decimal price = 0;
                if (decimal.TryParse(row[1]?.ToString(), out var p)) price = p;

                string description = row[2]?.ToString() ?? "";

                // Логика поиска и обновления
                var product = await _context.Products.FirstOrDefaultAsync(p => p.Name == name && p.ShopId == shopId);
                if (product != null)
                {
                    product.BasePrice = price;
                    // Обновляем описание, если нужно
                    if (!string.IsNullOrEmpty(description)) product.Description = description;
                }
                else
                {
                    product = new Product
                    {
                        Name = name,
                        BasePrice = price,
                        Description = description,
                        ShopId = shopId,
                        IsDailyOffer = false,
                        AssemblyTimeMinutes = 30,
                        CompositionJson = "{}", // Инициализируем, чтобы не было null
                        Color = "Микс", // Дефолтное значение
                        Occasion = "Без повода"
                    };
                    _context.Products.Add(product);
                }
                count++;
            }

            await _context.SaveChangesAsync();
            return count;
        }
    }
}