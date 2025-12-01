# FLUX.1-schnell Image Generation Setup

## Overview
DocMagic now uses **FLUX.1-schnell** via Nebius API for high-quality presentation image generation. This provides professional, AI-generated images for your slides.

## Setup Instructions

### 1. Get Your Nebius API Key

1. Visit [Nebius Token Factory](https://tokenfactory.nebius.com/)
2. Sign up for a free account
3. You'll receive **FREE credits** to get started
4. Copy your API key from the dashboard

### 2. Add to Environment Variables

Add your API key to `.env` or `.env.local`:

```bash
NEBIUS_API_KEY=your-nebius-api-key-here
```

### 3. Restart Your Development Server

```bash
npm run dev
```

## Features

### ✅ Automatic Image Generation
- When creating presentations, images are automatically generated using FLUX
- High-quality, professional images tailored to your slide content
- Optimized for presentation slides (1920x1080 resolution)

### ✅ Image Regeneration
- Don't like an image? Regenerate it with one click
- Each regeneration creates a unique variation
- Uses the same FLUX.1-schnell model for consistency

### ✅ Smart Prompts
- Automatically enhances prompts for better presentation images
- Adds professional styling keywords
- Optimizes for business and corporate contexts

## How It Works

### 1. During Presentation Generation
```typescript
// Automatically called when generating presentations
const images = await generatePresentationImages(slidePrompts, "1920x1080");
```

### 2. Regenerating a Single Image
```typescript
// API endpoint: POST /api/presentations/regenerate-image
const response = await fetch('/api/presentations/regenerate-image', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    prompt: "Professional business meeting",
    size: "1920x1080"
  })
});
```

### 3. Custom Image Generation
```typescript
import { generateFluxImage } from '@/lib/flux-image-generator';

const imageUrl = await generateFluxImage({
  prompt: "Modern tech startup office",
  size: "1920x1080"
});
```

## Supported Sizes

- `1920x1080` - 16:9 (Default for presentations)
- `1024x1024` - 1:1 (Square)
- `1024x768` - 4:3 (Classic)
- `768x1024` - 9:16 (Portrait)

## Prompt Enhancement

The system automatically enhances your prompts for better results:

**Your prompt:**
```
"Business meeting"
```

**Enhanced prompt:**
```
"Business meeting, professional presentation style, clean modern design, high quality, business appropriate"
```

## Fallback Behavior

If the Nebius API key is not set or there's an error:
- System falls back to placeholder images
- No errors are thrown
- Presentations still generate successfully

## Cost & Limits

- **Free tier**: Generous credits to get started
- **Pay-as-you-go**: Only pay for what you use
- **Rate limiting**: Built-in delays between requests to avoid hitting limits

## Troubleshooting

### Images not generating?
1. Check your `.env` file has `NEBIUS_API_KEY` set
2. Restart your dev server after adding the key
3. Check console logs for error messages

### Getting placeholder images?
- Your API key might be invalid
- You might have exhausted your credits
- Check the Nebius dashboard for usage

### Rate limit errors?
- The system has built-in delays
- For batch generation, images are generated sequentially
- Default delay: 1 second between requests

## API Reference

### `generateFluxImage(options)`
Generate a single image.

```typescript
const imageUrl = await generateFluxImage({
  prompt: "Your prompt here",
  size: "1920x1080",
  model: "FLUX.1-schnell" // optional
});
```

### `generatePresentationImages(prompts, size)`
Generate multiple images for slides.

```typescript
const images = await generatePresentationImages(
  ["Slide 1 prompt", "Slide 2 prompt"],
  "1920x1080"
);
```

### `regenerateSlideImage(prompt, size)`
Regenerate a single slide image.

```typescript
const newImage = await regenerateSlideImage(
  "Updated prompt",
  "1920x1080"
);
```

### `generateSlideImage(type, title, content, size)`
Generate image based on slide type.

```typescript
const image = await generateSlideImage(
  "title",
  "Welcome to Our Presentation",
  "Introduction content",
  "1920x1080"
);
```

## Best Practices

1. **Be Specific**: More detailed prompts = better images
2. **Use Context**: Include the slide topic in the prompt
3. **Professional Language**: Use business-appropriate terms
4. **Avoid Regenerating Too Often**: Each generation uses credits

## Example Prompts

### Good Prompts ✅
- "Modern tech startup office with diverse team collaborating"
- "Financial growth chart with upward trend, professional style"
- "Cloud computing infrastructure diagram, clean design"

### Poor Prompts ❌
- "Office" (too vague)
- "Chart" (not specific enough)
- "Picture of computers" (lacks context)

## Support

For issues or questions:
1. Check the console logs for detailed error messages
2. Verify your API key in the Nebius dashboard
3. Check your credit balance
4. Review the [Nebius documentation](https://tokenfactory.nebius.com/docs)

---

**Ready to create stunning presentations with AI-generated images!** 🎨✨
