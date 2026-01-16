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
            System.Text.Encoding.RegisterProvider(System.Text.CodePagesEncodingProvider.Instance);

            using var reader = ExcelReaderFactory.CreateReader(fileStream);
            var dataSet = reader.AsDataSet();

            if (dataSet.Tables.Count == 0) return 0;

            var dataTable = dataSet.Tables[0];
            int count = 0;

            // Пропускаем заголовок (i=1)
            for (int i = 1; i < dataTable.Rows.Count; i++)
            {
                var row = dataTable.Rows[i];

                // 0. Название
                string name = row[0]?.ToString()?.Trim();
                if (string.IsNullOrWhiteSpace(name)) continue;

                // 1. Цена
                decimal price = 0;
                if (decimal.TryParse(row[1]?.ToString(), out var p)) price = p;

                // 2. Описание
                string description = row[2]?.ToString()?.Trim() ?? "";

                // 3. Фото
                string? imageUrl = null;
                if (dataTable.Columns.Count > 3) imageUrl = row[3]?.ToString()?.Trim();

                // 4. Цвет
                string color = "Микс";
                if (dataTable.Columns.Count > 4)
                {
                    var val = row[4]?.ToString()?.Trim();
                    if (!string.IsNullOrEmpty(val)) color = val;
                }

                // 5. Повод
                string occasion = "Без повода";
                if (dataTable.Columns.Count > 5)
                {
                    var val = row[5]?.ToString()?.Trim();
                    if (!string.IsNullOrEmpty(val)) occasion = val;
                }

                // Логика поиска и обновления
                var product = await _context.Products.FirstOrDefaultAsync(p => p.Name == name && p.ShopId == shopId);

                if (product != null)
                {
                    // ОБНОВЛЕНИЕ
                    product.BasePrice = price;
                    if (!string.IsNullOrEmpty(description)) product.Description = description;
                    if (!string.IsNullOrEmpty(imageUrl)) product.ImageUrl = imageUrl;
                    // Обновляем фильтры тоже
                    product.Color = color;
                    product.Occasion = occasion;
                }
                else
                {
                    // СОЗДАНИЕ
                    product = new Product
                    {
                        Name = name,
                        BasePrice = price,
                        Description = description,
                        ImageUrl = imageUrl,
                        ShopId = shopId,
                        IsDailyOffer = false,
                        AssemblyTimeMinutes = 30, 
                        CompositionJson = "{}",
                        Color = color,       
                        Occasion = occasion 
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
            using var httpClient = new HttpClient();
            // Добавляем User-Agent, чтобы сервер Виктора не блокировал бота
            httpClient.DefaultRequestHeaders.Add("User-Agent", "MarioFlowersBot/1.0");

            var xmlStream = await httpClient.GetStreamAsync(url);
            var xdoc = await XDocument.LoadAsync(xmlStream, LoadOptions.None, CancellationToken.None);

            var offers = xdoc.Descendants("offer").ToList();
            int count = 0;

            // Словари для умного поиска
            var categories = xdoc.Descendants("category").ToDictionary(
                x => x.Attribute("id")?.Value,
                x => x.Value
            );

            foreach (var offer in offers)
            {
                var name = offer.Element("name")?.Value ?? offer.Element("model")?.Value;
                var priceString = offer.Element("price")?.Value;
                var description = offer.Element("description")?.Value ?? "";
                var picture = offer.Element("picture")?.Value;

                // Пытаемся достать категорию, если есть
                var categoryId = offer.Element("categoryId")?.Value;
                var categoryName = categoryId != null && categories.ContainsKey(categoryId) ? categories[categoryId] : "";

                if (string.IsNullOrWhiteSpace(name)) continue;

                if (!decimal.TryParse(priceString, System.Globalization.NumberStyles.Any, System.Globalization.CultureInfo.InvariantCulture, out var price))
                    price = 0;

                // === УМНЫЙ ПАРСИНГ ===
                string detectedColor = DetectColor(name + " " + description);
                string detectedOccasion = DetectOccasion(name + " " + description + " " + categoryName);

                var product = await _context.Products.FirstOrDefaultAsync(p => p.Name == name && p.ShopId == shopId);

                if (product != null)
                {
                    // Обновляем цены/картинки, но стараемся сохранить ручные правки селлера, если они были
                    product.BasePrice = price;
                    product.ImageUrl = picture;
                    // Обновляем фильтры только если они были дефолтными
                    if (product.Color == "Микс" || product.Color == null) product.Color = detectedColor;
                    if (product.Occasion == "Без повода" || product.Occasion == null) product.Occasion = detectedOccasion;
                }
                else
                {
                    product = new Product
                    {
                        Name = name,
                        BasePrice = price,
                        Description = description,
                        ImageUrl = picture,
                        ShopId = shopId,
                        IsDailyOffer = false,
                        AssemblyTimeMinutes = 30, // Дефолт
                        CompositionJson = "{}",
                        Color = detectedColor,       // <--- УМНЫЙ ЦВЕТ
                        Occasion = detectedOccasion, // <--- УМНЫЙ ПОВОД

                        // ВАЖНО: При создании товара сразу делаем снэпшот (если мы добавили эти поля в Product, а не только в OrderItem)
                        // Но у нас снэпшоты в OrderItem, так что тут ок.
                    };
                    _context.Products.Add(product);
                }
                count++;
            }

            await _context.SaveChangesAsync();
            return count;
        }

        // === ВСПОМОГАТЕЛЬНЫЕ МЕТОДЫ ===

        private string DetectColor(string text)
        {
            text = text.ToLower();

            if (text.Contains("красн") || text.Contains("бордо") || text.Contains("red")) return "Красный";
            if (text.Contains("бел") || text.Contains("white") || text.Contains("светл")) return "Белый";
            if (text.Contains("розов") || text.Contains("pink")) return "Розовый";
            if (text.Contains("желт") || text.Contains("yellow")) return "Желтый";
            if (text.Contains("оранж")) return "Оранжевый";
            if (text.Contains("синий") || text.Contains("голуб") || text.Contains("blue")) return "Синий";
            if (text.Contains("фиолет") || text.Contains("сирен")) return "Фиолетовый";
            if (text.Contains("персик")) return "Персиковый";

            return "Микс"; // Если не нашли
        }

        private string DetectOccasion(string text)
        {
            text = text.ToLower();

            if (text.Contains("рожден") || text.Contains("юбилей")) return "День рождения";
            if (text.Contains("свад") || text.Contains("невест")) return "Свадьба";
            if (text.Contains("люб") || text.Contains("сердц") || text.Contains("свидан") || text.Contains("роман")) return "Свидание";
            if (text.Contains("мам")) return "Маме";
            if (text.Contains("муж")) return "Коллеге";

            return "Без повода";
        }
    }
}