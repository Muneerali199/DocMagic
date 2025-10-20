# DocMagic Production Deployment Script
# PowerShell script to build and deploy to production

Write-Host "🚀 DocMagic Production Deployment" -ForegroundColor Cyan
Write-Host "=================================" -ForegroundColor Cyan
Write-Host ""

# Step 1: Check Node version
Write-Host "📦 Checking Node.js version..." -ForegroundColor Yellow
node --version
npm --version
Write-Host ""

# Step 2: Install dependencies
Write-Host "📦 Installing dependencies..." -ForegroundColor Yellow
npm install
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Failed to install dependencies" -ForegroundColor Red
    exit 1
}
Write-Host "✅ Dependencies installed" -ForegroundColor Green
Write-Host ""

# Step 3: Run linter
Write-Host "🔍 Running ESLint..." -ForegroundColor Yellow
npm run lint
if ($LASTEXITCODE -ne 0) {
    Write-Host "⚠️  Lint warnings found (continuing...)" -ForegroundColor Yellow
}
Write-Host ""

# Step 4: Build for production
Write-Host "🏗️  Building for production..." -ForegroundColor Yellow
npm run build
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Build failed" -ForegroundColor Red
    exit 1
}
Write-Host "✅ Build successful" -ForegroundColor Green
Write-Host ""

# Step 5: Git status
Write-Host "📝 Checking Git status..." -ForegroundColor Yellow
git status --short
Write-Host ""

# Step 6: Ask for commit
$commit = Read-Host "Do you want to commit and push to GitHub? (y/n)"
if ($commit -eq "y" -or $commit -eq "Y") {
    Write-Host "📝 Adding files to Git..." -ForegroundColor Yellow
    git add .
    
    $commitMsg = Read-Host "Enter commit message (or press Enter for default)"
    if ([string]::IsNullOrWhiteSpace($commitMsg)) {
        $commitMsg = "Production ready: Fixed resume generation, PDF export, and added admin panel"
    }
    
    Write-Host "💾 Committing changes..." -ForegroundColor Yellow
    git commit -m "$commitMsg"
    
    Write-Host "🚀 Pushing to GitHub..." -ForegroundColor Yellow
    git push origin main
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✅ Successfully pushed to GitHub" -ForegroundColor Green
    } else {
        Write-Host "❌ Failed to push to GitHub" -ForegroundColor Red
        exit 1
    }
}
Write-Host ""

# Step 7: Deployment options
Write-Host "🌐 Deployment Options:" -ForegroundColor Cyan
Write-Host "1. Deploy to Vercel (Recommended)" -ForegroundColor White
Write-Host "2. Deploy to Netlify" -ForegroundColor White
Write-Host "3. Deploy to Railway" -ForegroundColor White
Write-Host "4. Skip deployment" -ForegroundColor White
Write-Host ""

$deploy = Read-Host "Choose deployment option (1-4)"

switch ($deploy) {
    "1" {
        Write-Host "🚀 Deploying to Vercel..." -ForegroundColor Yellow
        Write-Host "Run: vercel --prod" -ForegroundColor Cyan
        Write-Host "Or install Vercel CLI: npm install -g vercel" -ForegroundColor Cyan
    }
    "2" {
        Write-Host "🚀 Deploying to Netlify..." -ForegroundColor Yellow
        Write-Host "Run: netlify deploy --prod" -ForegroundColor Cyan
        Write-Host "Or install Netlify CLI: npm install -g netlify-cli" -ForegroundColor Cyan
    }
    "3" {
        Write-Host "🚀 Deploying to Railway..." -ForegroundColor Yellow
        Write-Host "Run: railway up" -ForegroundColor Cyan
        Write-Host "Or install Railway CLI: npm install -g @railway/cli" -ForegroundColor Cyan
    }
    "4" {
        Write-Host "⏭️  Skipping deployment" -ForegroundColor Yellow
    }
}

Write-Host ""
Write-Host "✅ Deployment script completed!" -ForegroundColor Green
Write-Host ""
Write-Host "📋 Next Steps:" -ForegroundColor Cyan
Write-Host "1. Set environment variables in your deployment platform" -ForegroundColor White
Write-Host "2. Configure custom domain (optional)" -ForegroundColor White
Write-Host "3. Test all features in production" -ForegroundColor White
Write-Host "4. Monitor logs for errors" -ForegroundColor White
Write-Host ""
Write-Host "🎉 DocMagic is ready for production!" -ForegroundColor Green
