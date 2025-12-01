# 🎯 COVER SLIDE IMAGE FIX NEEDED

## Problem Identified

The cover slide (first slide) uses the image as a **BACKGROUND** instead of showing it as a normal image on the right side.

### Current Behavior (WRONG):
- Image is set as `backgroundImage` CSS property
- Image covers entire slide
- Text overlays on top of image
- Image is huge and full-screen

### Expected Behavior (CORRECT):
- Image should be on the RIGHT side (50% width)
- Content on LEFT side (50% width)
- Image should be 512x512 max
- Same layout as PPT export

## File to Fix

**File**: `components/presentation/presentation-preview.tsx`

**Lines**: ~455-541 (cover slide layout)

## What Needs to Change

### Current Code (lines 461-474):
```typescript
const backgroundImage = slide.image && !imageLoadErrors[slideIndex] 
  ? `url(${slide.image})` 
  : undefined;

// ...

<div 
  className={baseClasses}
  style={{
    backgroundImage,  // ❌ WRONG - using as background
    backgroundSize: "cover",
    backgroundPosition: slide.imagePosition || "center",
  }}
>
```

### Should Be:
```typescript
<div className={baseClasses}>
  <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 h-full p-8 sm:p-12">
    {/* Left Content - 50% */}
    <div className="flex flex-col justify-center space-y-6">
      <h1>{slide.title}</h1>
      <p>{slide.content}</p>
    </div>
    
    {/* Right Image - 50% */}
    <div className="flex items-center justify-center">
      <Image
        src={slide.image}
        alt={slide.title}
        width={512}
        height={512}
        style={{ maxWidth: '512px', maxHeight: '512px' }}
      />
    </div>
  </div>
</div>
```

## Quick Fix

Replace the entire cover slide case (lines 466-541) with a split layout similar to the "split" case (lines 543+).

### Steps:

1. Open `components/presentation/presentation-preview.tsx`
2. Find `case "cover":` (line ~466)
3. Replace the entire case block with:

```typescript
case "cover":
  return (
    <div className={baseClasses}>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 h-full p-8 sm:p-12">
        {/* Left Content - 50% */}
        <div className="flex flex-col justify-center space-y-6">
          <h1 className={cn("text-4xl sm:text-5xl lg:text-6xl font-bold leading-tight", templateStyles.accent)}>
            {slide.title}
          </h1>
          {slide.content && (
            <p className="text-lg sm:text-xl lg:text-2xl leading-relaxed opacity-90">
              {slide.content}
            </p>
          )}
          <div className={cn("w-24 h-1", templateStyles.accent.replace('text-', 'bg-'))}></div>
        </div>
        
        {/* Right Image - 50% */}
        <div className="flex items-center justify-center relative group">
          {slide.image && !imageLoadErrors[slideIndex] ? (
            <div className={cn("rounded-2xl overflow-hidden relative", templateStyles.shadow, "shadow-2xl")}>
              <Image
                src={slide.image}
                alt={slide.imageAlt || slide.title || 'Cover image'}
                className="w-full h-auto object-cover"
                style={{ maxHeight: '600px', maxWidth: '512px' }}
                onError={() => handleImageError(slideIndex)}
                width={512}
                height={512}
                unoptimized
              />
              {allowImageEditing && !isFullscreen && (
                <Button
                  size="sm"
                  variant="secondary"
                  onClick={() => handleEditImage(slideIndex)}
                  className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <Edit3 className="h-4 w-4 mr-2" />
                  Edit Image
                </Button>
              )}
            </div>
          ) : (
            <div className={cn(
              "rounded-2xl flex items-center justify-center w-full h-96",
              theme === 'dark' ? 'bg-gray-800' : 'bg-gray-100'
            )}>
              <ImageIcon className={cn("h-16 w-16", theme === 'dark' ? 'text-gray-600' : 'text-gray-400')} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
```

## Benefits

After this fix:
- ✅ Cover slide shows image on right (not as background)
- ✅ Image is 512x512 max (not full-screen)
- ✅ Matches PPT export layout
- ✅ All 8 slides will show images properly
- ✅ Consistent layout across all slides

## Test After Fix

1. Create presentation
2. Check slide 1 (cover) - image should be on RIGHT side, not background
3. Check slides 2-8 - images should be on RIGHT side
4. All images should be visible and properly sized

---

**TL;DR**: The cover slide needs to use a split layout (50/50) with image on the right, not as a full-screen background.
