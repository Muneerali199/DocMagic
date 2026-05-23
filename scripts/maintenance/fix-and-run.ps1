# Fix CSS Syntax Error and Start Dev Server
# Run this script: .\fix-and-run.ps1

Write-Host "🔧 Fixing CSS syntax error..." -ForegroundColor Yellow

# Read the CSS file
$cssFile = "app\globals.css"
$content = Get-Content $cssFile -Raw

# Fix the syntax error
$fixedContent = $content -replace '@apply text-2xl sm: text-4xl md: text-5xl lg: text-7xl', '@apply text-2xl sm:text-4xl md:text-5xl lg:text-7xl'

# Write back to file
$fixedContent | Set-Content $cssFile -NoNewline

Write-Host "✅ CSS syntax fixed!" -ForegroundColor Green

# Clear Next.js cache
Write-Host "🧹 Clearing Next.js cache..." -ForegroundColor Yellow
if (Test-Path ".next") {
    Remove-Item -Recurse -Force .next
    Write-Host "✅ Cache cleared!" -ForegroundColor Green
} else {
    Write-Host "ℹ️ No cache to clear" -ForegroundColor Cyan
}

# Start dev server
Write-Host "🚀 Starting development server..." -ForegroundColor Yellow
npm run dev
