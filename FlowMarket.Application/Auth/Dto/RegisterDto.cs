namespace FlowMarket.Application.Auth.Dto
{
    public class RegisterDto
    {
        public string FullName { get; set; }
        public string Email { get; set; }
        public string Password { get; set; }
        public string PhoneNumber { get; set; }
        public int Role { get; set; } // 0=Admin, 1=Seller, 2=Buyer
    }
}