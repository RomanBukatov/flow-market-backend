namespace FlowMarket.Application.Auth.Dto
{
    public class UserProfileDto
    {
        public Guid Id { get; set; }
        public string FullName { get; set; }
        public string Email { get; set; }
        public string Phone { get; set; }
        public decimal BonusBalance { get; set; }
        public string Role { get; set; }
    }
}