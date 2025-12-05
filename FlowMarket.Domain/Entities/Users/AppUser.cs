using System.Collections.Generic;

namespace Marketplace.Domain.Entities.Users
{
    public enum UserRole
    {
        Admin,
        Seller,
        Buyer
    }

    public class AppUser : BaseEntity
    {
        public string FullName { get; set; }
        public string PhoneNumber { get; set; }
        public string Email { get; set; }
        public string PasswordHash { get; set; }
        public UserRole Role { get; set; }
        public decimal BonusBalance { get; set; } = 0;
        public ICollection<Shop> OwnedShops { get; set; }
    }
}