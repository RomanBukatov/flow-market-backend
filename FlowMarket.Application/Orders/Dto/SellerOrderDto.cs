namespace FlowMarket.Application.Orders.Dto;

public class SellerOrderDto
{
    public Guid SubOrderId { get; set; }
    public Guid OrderId { get; set; }
    public DateTime CreatedAt { get; set; }
    public string Status { get; set; }
    public string UserPhone { get; set; }
    public string UserAddress { get; set; }
    public decimal TotalPrice { get; set; }
    public List<SellerOrderItemDto> Items { get; set; }
}