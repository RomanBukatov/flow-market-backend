using FlowMarket.Application.Orders.Interfaces;
using Microsoft.AspNetCore.Mvc;

namespace FlowMarket.Api.Controllers
{
    [ApiController]
    [Route("fake-pay")]
    public class FakePaymentController : ControllerBase
    {
        private readonly IOrderService _orderService;

        public FakePaymentController(IOrderService orderService)
        {
            _orderService = orderService;
        }
        [HttpGet("{orderId}")]
        public IActionResult FakePayPage(Guid orderId)
        {
            var html = $@"
                <html>
                <head>
                    <meta charset='utf-8'>
                    <title>Банк</title>
                </head>
                <body style='font-family: sans-serif; text-align: center; padding: 50px;'>
                    <h1 style='color: green;'>🏦 Имитация Банка</h1>
                    <h2>Оплата заказа: {orderId}</h2>
                    <p>Сумма списана (понарошку).</p>
                    <script>
                      function pay() {{
                          fetch('/fake-pay/webhook/success?orderId={orderId}', {{ method: 'POST' }})
                            .then(res => {{
                                if(res.ok) {{
                                    alert('Успешно оплачено! Заказ перешел в работу.');
                                    window.close(); // Пытаемся закрыть вкладку
                                }}
                            }});
                      }}
                    </script>
                    <button onclick='pay()' style='padding: 10px 20px; font-size: 18px; cursor: pointer;'>Оплатить</button>
                </body>
                </html>";

            return Content(html, "text/html; charset=utf-8");
        }

        [HttpPost("webhook/success")] 
        public async Task<IActionResult> PaymentSuccess([FromQuery] Guid orderId)
        {
            await _orderService.ConfirmPaymentAsync(orderId);
            return Ok("Payment Confirmed");
        }
    }
}