using AutoMapper;
using FlowMarket.Application.Catalog.Dto;
using FlowMarket.Application.Shops.Dto;
using FlowMarket.Domain.Entities.Products;
using FlowMarket.Domain.Entities.Shops;

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
                // Если ImageUrl пустой, ставим заглушку. Если есть - берем его.
                .ForMember(dest => dest.ImageUrl, opt => opt.MapFrom(src =>
                    string.IsNullOrEmpty(src.ImageUrl) ? "https://placehold.co/600x400" : src.ImageUrl));

            CreateMap<CreateProductDto, Product>();
            CreateMap<CreateShopDto, Shop>();
            CreateMap<Shop, ShopDto>();
        }
    }
}