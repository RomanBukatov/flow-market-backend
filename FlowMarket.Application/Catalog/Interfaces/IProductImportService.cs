namespace FlowMarket.Application.Catalog.Interfaces;

public interface IProductImportService
{
    Task<int> ImportFromExcelAsync(Stream fileStream, Guid shopId);
    Task<int> ImportFromYmlUrlAsync(string url, Guid shopId);
}