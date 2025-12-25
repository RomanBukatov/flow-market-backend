using System.IO;
using System.Net.Http;
using System.Threading;
using System.Threading.Tasks;
using System.Xml.Linq;
using ExcelDataReader;
using FlowMarket.Application.Catalog.Interfaces;
using FlowMarket.Domain.Entities.Products;
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

                // ЧИТАЕМ КАРТИНКУ (Колонка D / Индекс 3)
                string? imageUrl = null;
                if (dataTable.Columns.Count > 3) // Проверка, что колонка вообще есть
                {
                    imageUrl = row[3]?.ToString();
                }

                // Логика поиска и обновления
                var product = await _context.Products.FirstOrDefaultAsync(p => p.Name == name && p.ShopId == shopId);
                if (product != null)
                {
                    product.BasePrice = price;
                    // Обновляем описание, если нужно
                    if (!string.IsNullOrEmpty(description)) product.Description = description;
                    if (!string.IsNullOrEmpty(imageUrl)) product.ImageUrl = imageUrl; // <--- ОБНОВЛЯЕМ ССЫЛКУ
                }
                else
                {
                    product = new Product
                    {
                        Name = name,
                        BasePrice = price,
                        Description = description,
                        ImageUrl = imageUrl, // <--- ЗАПИСЫВАЕМ ССЫЛКУ
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

        public async Task<int> ImportFromYmlUrlAsync(string url, Guid shopId)
        {
            // 1. Скачиваем файл
            using var httpClient = new HttpClient();
            var xmlStream = await httpClient.GetStreamAsync(url);

            // 2. Загружаем XML
            var xdoc = await XDocument.LoadAsync(xmlStream, LoadOptions.None, CancellationToken.None);

            // 3. Ищем товары (в YML они лежат в <shop><offers><offer>)
            // Учитываем разные неймспейсы, берем просто Descendants("offer")
            var offers = xdoc.Descendants("offer").ToList();
            int count = 0;

            foreach (var offer in offers)
            {
                // Парсим данные
                var name = offer.Element("name")?.Value ?? offer.Element("model")?.Value;
                var priceString = offer.Element("price")?.Value;
                var description = offer.Element("description")?.Value ?? "";
                var picture = offer.Element("picture")?.Value; // Ссылка на фото!

                // Категория и параметры (пока пропустим для MVP, берем базу)

                if (string.IsNullOrWhiteSpace(name)) continue;
                if (!decimal.TryParse(priceString, System.Globalization.NumberStyles.Any, System.Globalization.CultureInfo.InvariantCulture, out var price))
                    price = 0;

                // 4. Логика сохранения (копипаст из Excel метода, можно вынести в отдельный метод)
                var product = await _context.Products.FirstOrDefaultAsync(p => p.Name == name && p.ShopId == shopId);

                if (product != null)
                {
                    product.BasePrice = price;
                    product.ImageUrl = picture; // Обновляем картинку!
                    if (!string.IsNullOrEmpty(description)) product.Description = description;
                }
                else
                {
                    product = new Product
                    {
                        Name = name,
                        BasePrice = price,
                        Description = description,
                        ImageUrl = picture, // Записываем картинку
                        ShopId = shopId,
                        IsDailyOffer = false,
                        AssemblyTimeMinutes = 30,
                        CompositionJson = "{}",
                        Color = "Микс",
                        Occasion = "Из YML"
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