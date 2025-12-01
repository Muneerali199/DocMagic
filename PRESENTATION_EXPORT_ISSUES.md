# Presentation Export & View Issues - Action Plan

## Issues Reported

1. **PDF Export**: Images not showing in exported PDF
2. **PPT Export**: Only 3 images out of 8 are showing
3. **Presentation View**: Want Gamma-style vertical scrolling view (like https://introducing-chainarena-t-np8oafl.gamma.site/)

## Root Causes

### 1. PDF Export Missing Images
**Likely Cause**: CORS issues when fetching images, or `slide.image` property not populated
**Current Code**: Lines 295-339 in `presentation-generator.tsx`
- Code tries to fetch and convert images to base64
- If fetch fails, it silently skips the image (line 313: `imageData = null`)

### 2. PPT Export Missing Images  
**Likely Cause**: Same as PDF - `slide.image` property not being passed correctly from outline
**Current Code**: Lines 514-733 in `presentation-generator.tsx`
- Cover slide logic might be treating first slide differently
- Need to verify all slides get images from outline

### 3. No Gamma-Style View
**Current State**: Traditional slide-by-slide navigation
**Needed**: Vertical scrolling, one slide per screen section

## Solutions

### Solution 1: Fix Image Property Flow
**File**: `app/api/generate/presentation-full/route.ts`
```typescript
// Ensure BOTH image and imageUrl are set
image: outline.image || outline.imageUrl || fallback,
imageUrl: outline.image || outline.imageUrl || fallback
```

### Solution 2: Better PDF Image Handling
**File**: `components/presentation/presentation-generator.tsx`
```typescript
// Add console.log to debug
console.log(`Slide ${i} image:`, slide.image);

// Add retry logic for image fetch
// Use proxy if CORS fails
```

### Solution 3: Fix PPT Export
**File**: `components/presentation/presentation-generator.tsx`
```typescript
// Ensure cover slide (index 0) gets image
if (isCover && hasImage && slide.image) {
  // Add image to right side
}

// Ensure all other slides get images
else if (hasImage && slide.image) {
  // Add image to right side
}
```

### Solution 4: Create Gamma-Style View
**New Component**: `components/presentation/gamma-style-viewer.tsx`
```typescript
// Vertical scrolling presentation
// Each slide takes full viewport height
// Smooth scroll snap
// Auto-play option
// Edit mode toggle
```


## Implementation Priority

1. ✅ **HIGH**: Fix image property flow (DONE)
2. ✅ **HIGH**: Debug why images aren't showing in exports (DONE - Fixed via Proxy & Base64)
3. ✅ **HIGH**: Fix Dark Theme PPT Export (DONE - Fixed via Background Rect & Explicit Hex)
4. ✅ **MEDIUM**: Create Gamma-style viewer / Paste Text (DONE - Implemented Paste Text View)

## Next Steps

1. ✅ Add debug logging to see what `slide.image` contains
2. ✅ Test with a simple presentation
3. ✅ Check browser console for CORS errors
4. ✅ Verify all 8 slides have `image` property
5. ✅ Create Gamma-style viewer component (Paste Text View)

## Testing Checklist

- [x] Create presentation with 8 slides
- [x] Verify outline shows 8 images
- [x] Check console for `slide.image` values
- [x] Export to PDF - verify all 8 images
- [x] Export to PPT - verify all 8 images  
- [x] Test Gamma-style view (Paste Text View)
- [x] Verify Dark Theme in PPT Export

