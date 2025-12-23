using FlowMarket.Application.Catalog.Interfaces;
using Microsoft.AspNetCore.Mvc;

namespace FlowMarket.Api.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class CatalogController : ControllerBase
    {
        private readonly IProductImportService _importService;

        public CatalogController(IProductImportService importService)
        {
            _importService = importService;
        }

        // POST: api/catalog/import
        [HttpPost("import")]
        [DisableRequestSizeLimit] // Разрешаем большие файлы
        public async Task<IActionResult> ImportProducts(IFormFile file, Guid shopId)
        {
            if (file == null || file.Length == 0)
                return BadRequest("Файл не выбран");

            // Проверяем расширение
            var ext = Path.GetExtension(file.FileName).ToLower();
            if (ext != ".xlsx" && ext != ".xls")
                return BadRequest("Разрешены только Excel файлы (.xlsx, .xls)");

            try
            {
                // Открываем поток чтения
                using var stream = file.OpenReadStream();
                
                // Запускаем импорт
                int count = await _importService.ImportFromExcelAsync(stream, shopId);

                return Ok(new { message = $"Успешно обработано товаров: {count}" });
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Ошибка импорта: {ex.Message}");
            }
        }

        // POST: api/catalog/import-yml
        [HttpPost("import-yml")]
        public async Task<IActionResult> ImportYml([FromQuery] string url, [FromQuery] Guid shopId)
        {
            if (string.IsNullOrEmpty(url))
                return BadRequest("URL не указан");

            try
            {
                int count = await _importService.ImportFromYmlUrlAsync(url, shopId);
                return Ok(new { message = $"Успешно загружено из YML: {count} товаров" });
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Ошибка импорта YML: {ex.Message}");
            }
        }
    }
}