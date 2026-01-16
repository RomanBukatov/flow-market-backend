# ЭТАП 1: СБОРКА (Build)
# Используем образ SDK для компиляции кода
FROM mcr.microsoft.com/dotnet/sdk:10.0 AS build
WORKDIR /src

# Копируем файлы проектов (чтобы восстановить зависимости)
COPY ["FlowMarket.Api/FlowMarket.Api.csproj", "FlowMarket.Api/"]
COPY ["FlowMarket.Application/FlowMarket.Application.csproj", "FlowMarket.Application/"]
COPY ["FlowMarket.Domain/FlowMarket.Domain.csproj", "FlowMarket.Domain/"]
COPY ["FlowMarket.Infrastructure/FlowMarket.Infrastructure.csproj", "FlowMarket.Infrastructure/"]

# Восстанавливаем пакеты
RUN dotnet restore "FlowMarket.Api/FlowMarket.Api.csproj"

# Копируем весь остальной код
COPY . .

# Собираем и публикуем (Publish) в папку /app/publish
WORKDIR "/src/FlowMarket.Api"
RUN dotnet publish "FlowMarket.Api.csproj" -c Release -o /app/publish /p:UseAppHost=false

# ЭТАП 2: ЗАПУСК (Runtime)
# Используем легкий образ (только для запуска), чтобы контейнер весил мало
FROM mcr.microsoft.com/dotnet/aspnet:10.0 AS final
WORKDIR /app
COPY --from=build /app/publish .

# Открываем порт 8080 (стандарт для .NET в контейнере)
EXPOSE 8080

# Создаем юзера appuser
RUN adduser -u 5678 --disabled-password --gecos "" appuser && chown -R appuser /app
USER appuser

# Команда запуска
ENTRYPOINT ["dotnet", "FlowMarket.Api.dll"]