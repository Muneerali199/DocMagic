# Quick Integration Steps

## Option 1: Manual Edit (Recommended)

Open `components/presentation/presentation-generator.tsx` and make these changes:

### 1. Add import at the top (around line 17):
```typescript
import { UrlInputSection } from "@/components/presentation/url-input-section";
```

### 2. Find and replace the textarea section (around line 1008-1021)

**FIND THIS:**
```tsx
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
```

**REPLACE WITH:**
```tsx
              <UrlInputSection
                prompt={prompt}
                setPrompt={setPrompt}
                isGenerating={isGenerating}
              />
```

That's it! Save the file and test.

## Option 2: Using sed command (if you prefer)

Run this command in PowerShell from the DocMagic directory:

```powershell
# First, add the import
(Get-Content "components/presentation/presentation-generator.tsx") -replace 'import { SlideOutlinePreview } from "@/components/presentation/slide-outline-preview";', 'import { SlideOutlinePreview } from "@/components/presentation/slide-outline-preview";
import { UrlInputSection } from "@/components/presentation/url-input-section";' | Set-Content "components/presentation/presentation-generator.tsx"
```

Then manually replace the textarea section with the UrlInputSection component.

## Testing

1. Start your dev server: `npm run dev`
2. Navigate to the Presentation section
3. You should see two tabs: "Text Input" and "From URL"
4. Test the URL feature with: `https://en.wikipedia.org/wiki/Machine_learning`
5. Click "Extract Content from URL"
6. Verify content is extracted successfully
7. Generate your presentation!

## Troubleshooting

**If you see "Module not found" error:**
- Make sure `url-input-section.tsx` exists in `components/presentation/`
- Restart your dev server

**If URL extraction fails:**
- Check that the URL is valid (starts with http:// or https://)
- Some websites may block scraping - try a different URL
- Check browser console for detailed error messages

**If styling looks off:**
- Make sure all your UI components are properly installed
- The component uses your existing design system (glass-effect, bolt-gradient, etc.)
