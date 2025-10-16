# Manual Fix - Add URL Feature to Presentation Page

## Quick Fix (2 Steps)

### Step 1: Add Import
Open `components/presentation/presentation-generator.tsx`

Find line 14 (around the imports):
```typescript
import { SlideOutlinePreview } from "@/components/presentation/slide-outline-preview";
```

Add this line RIGHT AFTER it:
```typescript
import { UrlInputSection } from "@/components/presentation/url-input-section";
```

### Step 2: Replace Textarea
In the SAME file, scroll down to around **line 1008-1021**

Find this block:
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

Replace it with:
```tsx
              <UrlInputSection
                prompt={prompt}
                setPrompt={setPrompt}
                isGenerating={isGenerating}
              />
```

### Step 3: Save and Restart
1. Save the file (Ctrl+S)
2. Restart your dev server:
   ```bash
   # Stop current server (Ctrl+C)
   npm run dev
   ```
3. Go to http://localhost:3000/presentation
4. You should now see TWO TABS: "Text Input" and "From URL"

## Alternative: Use PowerShell Script

Run this in PowerShell from the DocMagic directory:
```powershell
.\apply-url-feature.ps1
```

Then restart your dev server.

## Verification

After the changes, you should see:
- ✅ Two tabs at the top: "Text Input" and "From URL"
- ✅ "From URL" tab has a URL input field
- ✅ "Extract Content from URL" button
- ✅ Original text input still works in "Text Input" tab

## Still Not Working?

1. **Check the import was added**: Look at the top of `presentation-generator.tsx`
2. **Check the component was replaced**: Search for `<UrlInputSection` in the file
3. **Clear browser cache**: Hard refresh (Ctrl+Shift+R)
4. **Check console for errors**: Open browser DevTools (F12)

Need help? The files are all created and ready - you just need to connect them!
