# PowerShell script to integrate URL feature into presentation-generator.tsx

$filePath = "components\presentation\presentation-generator.tsx"
$content = Get-Content $filePath -Raw

# Step 1: Add import if not already present
if ($content -notmatch "UrlInputSection") {
    $content = $content -replace '(import { SlideOutlinePreview } from "@/components/presentation/slide-outline-preview";)', "`$1`nimport { UrlInputSection } from `"@/components/presentation/url-input-section`";"
    Write-Host "✓ Added UrlInputSection import" -ForegroundColor Green
} else {
    Write-Host "✓ Import already exists" -ForegroundColor Yellow
}

# Step 2: Replace the textarea section with UrlInputSection component
$oldPattern = @'
              <div className="space-y-2">
                <Label htmlFor="prompt" className="text-sm font-medium flex items-center gap-2">
                  <Sparkles className="h-4 w-4 text-yellow-500" />
                  Describe your presentation
                </Label>
                <Textarea
                  id="prompt"
                  placeholder="E.g., Create a startup pitch deck for an AI-powered fitness app targeting millennials, including market analysis, product features, business model, and funding requirements"
                  className="min-h-[140px] text-base glass-effect border-yellow-400/30 focus:border-yellow-400/60 focus:ring-yellow-400/20 resize-none"
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  disabled={isGenerating}
                />
              </div>
'@

$newPattern = @'
              <UrlInputSection
                prompt={prompt}
                setPrompt={setPrompt}
                isGenerating={isGenerating}
              />
'@

if ($content -match [regex]::Escape($oldPattern)) {
    $content = $content -replace [regex]::Escape($oldPattern), $newPattern
    Write-Host "✓ Replaced textarea with UrlInputSection component" -ForegroundColor Green
} else {
    Write-Host "✗ Could not find textarea section to replace" -ForegroundColor Red
    Write-Host "You may need to manually replace it. See EXACT_CODE_TO_ADD.txt" -ForegroundColor Yellow
}

# Save the file
Set-Content $filePath -Value $content

Write-Host "`n✅ Integration complete!" -ForegroundColor Green
Write-Host "Now restart your dev server and check the Presentation page." -ForegroundColor Cyan
