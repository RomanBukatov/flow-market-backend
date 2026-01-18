using AutoMapper;
using FlowMarket.Application.Catalog.Dto;
using FlowMarket.Application.Shops.Dto;
using FlowMarket.Domain.Entities.Products;
using FlowMarket.Domain.Entities.Shops;
using FlowMarket.Application.Shops.Dto;
using FlowMarket.Domain.Entities.Shops;
using FlowMarket.Application.Auth.Dto;
using FlowMarket.Domain.Entities.Users;

namespace FlowMarket.Application.Common.Mappings
{
    public class MappingProfile : Profile
    {
        public MappingProfile()
        {
            CreateMap<Product, ProductDto>()
                .ForMember(dest => dest.Price, opt => opt.MapFrom(src => src.BasePrice))
                .ForMember(dest => dest.ShopName, opt => opt.MapFrom(src => src.Shop.Name))
                .ForMember(dest => dest.ShopId, opt => opt.MapFrom(src => src.ShopId))
                .ForMember(dest => dest.Composition, opt => opt.MapFrom(src => src.CompositionJson))
                .ForMember(dest => dest.CreatedAt, opt => opt.MapFrom(src => src.CreatedAt))
                .ForMember(dest => dest.IsDailyOffer, opt => opt.MapFrom(src => src.IsDailyOffer))
                .ForMember(dest => dest.ImageUrl, opt => opt.MapFrom(src =>
                    string.IsNullOrEmpty(src.ImageUrl) ? "https://placehold.co/600x400" : src.ImageUrl))
                .ForMember(dest => dest.Color, opt => opt.MapFrom(src => src.Color))
                .ForMember(dest => dest.Occasion, opt => opt.MapFrom(src => src.Occasion));

            CreateMap<CreateProductDto, Product>();
            CreateMap<CreateShopDto, Shop>();
            CreateMap<Shop, ShopDto>();
            CreateMap<CreateDeliveryZoneDto, DeliveryZone>();
            CreateMap<DeliveryZone, DeliveryZoneDto>();
            CreateMap<AppUser, UserProfileDto>()
                .ForMember(dest => dest.Phone, opt => opt.MapFrom(src => src.PhoneNumber));
        }
    }
}