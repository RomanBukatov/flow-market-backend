using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace FlowMarket.Api.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class FilesController : ControllerBase
    {
        private readonly IWebHostEnvironment _env;
        private readonly IConfiguration _configuration;

        public FilesController(IWebHostEnvironment env, IConfiguration configuration)
        {
            _env = env;
            _configuration = configuration;
        }

        [HttpPost("upload")]
        [Authorize] // Только для своих
        public async Task<IActionResult> UploadFile(IFormFile file)
        {
            if (file == null || file.Length == 0)
                return BadRequest("Файл не выбран");

            // 1. Проверяем расширение
            var ext = Path.GetExtension(file.FileName).ToLower();
            var allowedExtensions = new[] { ".jpg", ".jpeg", ".png", ".webp" };
            if (!allowedExtensions.Contains(ext))
                return BadRequest("Только картинки (jpg, png, webp)");

            // 2. Генерируем уникальное имя
            var fileName = $"{Guid.NewGuid()}{ext}";
            
            // 3. Путь сохранения: wwwroot/images
            var uploadsFolder = Path.Combine(_env.WebRootPath, "images");
            if (!Directory.Exists(uploadsFolder))
                Directory.CreateDirectory(uploadsFolder);

            var filePath = Path.Combine(uploadsFolder, fileName);

            // 4. Сохраняем
            using (var stream = new FileStream(filePath, FileMode.Create))
            {
                await file.CopyToAsync(stream);
            }

            // 5. Формируем публичную ссылку
            // Берем базовый URL из конфига (AppUrl), который мы настраивали для банка
            var baseUrl = _configuration["AppUrl"] ?? $"{this.Request.Scheme}://{this.Request.Host}";
            var url = $"{baseUrl}/images/{fileName}";

            return Ok(new { url = url });
        }
    }
}