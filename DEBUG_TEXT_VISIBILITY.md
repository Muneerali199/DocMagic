# DEBUG: Text Visibility Issue

## Current Status

Added debug logging to `lib/color-contrast.ts` to help identify the issue.

## How to Test & Debug

### Step 1: Open Browser Console
1. Open your browser
2. Press `F12` to open DevTools
3. Go to the **Console** tab

### Step 2: Create a Presentation
1. Navigate to `/presentation`
2. Create a new presentation
3. Select a theme with **black background** (e.g., Spectrum, Alien, Fluo)

### Step 3: Check Console Logs
You should see logs like this:

```
🎨 getOptimalTextColor called with: bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500
  → Extracted dominant color: indigo-500
  → Converted to hex: #6366f1
  → Parsed RGB: {r: 99, g: 102, b: 241}
  → Calculated luminance: 0.234
  → Final text color: #ffffff
```

### What to Look For

#### ✅ GOOD (Working):
- Luminance < 0.5 for dark backgrounds → Returns `#ffffff` (white)
- Luminance > 0.5 for light backgrounds → Returns `#000000` (black)

#### ❌ BAD (Not Working):
- "Could not parse color" message
- Wrong luminance calculation
- Wrong text color returned

## Expected Luminance Values

| Background | Luminance | Text Color |
|-----------|-----------|------------|
| Black (#000000) | 0.00 | White |
| Slate-900 (#0F172A) | ~0.02 | White |
| Blue-500 (#3B82F6) | ~0.20 | White |
| Gray-500 (#6B7280) | ~0.30 | White |
| White (#FFFFFF) | 1.00 | Black |
| Yellow-100 (#FEF9C3) | ~0.95 | Black |

## If Text is Still Not Visible

### Check 1: Verify the gradient class
Look at the first console log line. It should show something like:
```
🎨 getOptimalTextColor called with: bg-gradient-to-br from-slate-900 to-indigo-950
```

If it shows something else (like just "black" or empty string), that's the problem.

### Check 2: Verify the parsing
The logs should show:
```
  → Extracted dominant color: slate-900
  → Converted to hex: #0f172a
  → Parsed RGB: {r: 15, g: 23, b: 42}
```

If any of these are `null` or missing, the parser isn't working.

### Check 3: Verify the luminance
For dark backgrounds, luminance should be < 0.5:
```
  → Calculated luminance: 0.02  ✅ (< 0.5, will return white)
```

### Check 4: Verify the final color
```
  → Final text color: #ffffff  ✅ (white text for dark background)
```

## Quick Fix if Still Not Working

If the console shows the color is being parsed correctly but text is still not visible, the issue might be with CSS specificity. Try this:

1. Open DevTools
2. Inspect the slide text element
3. Check the computed `color` style
4. If it's not white, check what's overriding it

## Manual Override (Temporary)

If you need a quick fix while debugging, you can force white text by editing line 1433 in `real-time-generator.tsx`:

```typescript
// Temporary override - force white text
let textColor = '#ffffff';
```

Then test if the text appears. If it does, the issue is with the color calculation. If it doesn't, the issue is with CSS.

---

**Next Steps**: 
1. Test with a black background theme
2. Check browser console for logs
3. Report back what you see in the console
