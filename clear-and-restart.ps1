# Clear Next.js cache and restart server

Write-Host "🧹 Clearing Next.js cache..." -ForegroundColor Yellow

# Stop any running processes
Write-Host "Stopping any running processes..." -ForegroundColor Cyan
Get-Process -Name node -ErrorAction SilentlyContinue | Stop-Process -Force

# Delete .next folder
if (Test-Path ".next") {
    Write-Host "Deleting .next folder..." -ForegroundColor Cyan
    Remove-Item -Recurse -Force .next
    Write-Host "✅ .next folder deleted" -ForegroundColor Green
}

# Delete node_modules/.cache
if (Test-Path "node_modules/.cache") {
    Write-Host "Deleting node_modules cache..." -ForegroundColor Cyan
    Remove-Item -Recurse -Force node_modules/.cache
    Write-Host "✅ Cache deleted" -ForegroundColor Green
}

Write-Host ""
Write-Host "✅ Cache cleared successfully!" -ForegroundColor Green
Write-Host ""
Write-Host "🚀 Starting development server..." -ForegroundColor Yellow
Write-Host ""

# Start the server
npm run dev
