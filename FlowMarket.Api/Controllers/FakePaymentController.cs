using Microsoft.AspNetCore.Mvc;

namespace FlowMarket.Api.Controllers
{
    [ApiController]
    [Route("fake-pay")]
    public class FakePaymentController : ControllerBase
    {
        // GET: /fake-pay/{orderId}
        [HttpGet("{orderId}")]
        public IActionResult FakePayPage(Guid orderId)
        {
            var html = $@"
                <html>
                <head>
                    <meta charset='utf-8'> <!-- Добавили мета-тег -->
                    <title>Банк</title>
                </head>
                <body style='font-family: sans-serif; text-align: center; padding: 50px;'>
                    <h1 style='color: green;'>🏦 Имитация Банка</h1>
                    <h2>Оплата заказа: {orderId}</h2>
                    <p>Сумма списана (понарошку).</p>
                    <button onclick='alert(""Успешно!"")' style='padding: 10px 20px; font-size: 18px; cursor: pointer;'>Оплатить</button>
                </body>
                </html>";

            // Явно указываем кодировку в заголовке
            return Content(html, "text/html; charset=utf-8"); 
        }
    }
}