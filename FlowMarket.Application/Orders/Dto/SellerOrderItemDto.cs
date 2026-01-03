namespace FlowMarket.Application.Orders.Dto;

public class SellerOrderItemDto
{
    public string ProductName { get; set; }
    public int Quantity { get; set; }
    public decimal Price { get; set; }
    public decimal TotalPrice { get; set; }
    public string ImageUrl { get; set; }
}