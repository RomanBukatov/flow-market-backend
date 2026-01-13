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
                    product.ImageUrl = picture;
                    if (!string.IsNullOrEmpty(description)) product.Description = description;
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