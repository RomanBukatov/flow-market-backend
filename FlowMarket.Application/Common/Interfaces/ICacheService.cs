namespace FlowMarket.Application.Common.Interfaces
{
    public interface ICacheService
    {
        // Положить в кэш (с временем жизни)
        Task SetAsync<T>(string key, T value, TimeSpan? expiration = null);

        // Достать из кэша
        Task<T?> GetAsync<T>(string key);

        // Удалить из кэша (например, если товар изменился)
        Task RemoveAsync(string key);
    }
}