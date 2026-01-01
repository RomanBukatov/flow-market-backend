namespace FlowMarket.Application.Orders.Dto;

public class OrderResultDto
{
    public Guid OrderId { get; set; }
    public decimal TotalAmount { get; set; }
    public string PaymentLink { get; set; }
}