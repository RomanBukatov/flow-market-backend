# Удаление папок сборки .NET
Get-ChildItem -Include bin,obj -Recurse | Remove-Item -Force -Recurse

# Удаление папок сборки и зависимостей React
Get-ChildItem -Include node_modules,dist,dev-dist -Recurse | Where-Object { $_.FullName -match "flowmarket-client" } | Remove-Item -Force -Recurse

Write-Host "✅ Проект очищен от мусора. Можно архивировать!" -ForegroundColor Green