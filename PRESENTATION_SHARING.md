# 🌐 Presentation Sharing & Collaboration - Complete Guide

## 🎉 Overview

DocMagic presentations now support **sharing**, **collaboration**, and **Flux AI image generation**! Create stunning presentations, save them to the cloud, and share them with anyone via a simple link.

---

## ✨ New Features

### 1. **💾 Save & Share**
- **One-Click Save**: Save your presentation to Supabase with a single click
- **Instant Share Links**: Get a shareable URL immediately after saving
- **Public Access**: Anyone with the link can view your presentation
- **Beautiful Share Modal**: Copy links, open presentations, and share text easily

### 2. **🎨 Flux AI Image Generation**
- **Automatic Background Images**: AI generates stunning backgrounds for each slide
- **Gamma-Style Quality**: Professional, vibrant, cinematic images
- **Smart Prompts**: AI enhances prompts based on slide type (hero, content, stats, etc.)
- **Multiple Sizes**: Support for 1024x1024, 1024x768, and 1024x576 (16:9)

### 3. **👥 Collaboration (Foundation Ready)**
- **View-Only Links**: Share presentations for viewing
- **Permission System**: Foundation for edit/view permissions
- **Real-time Ready**: Architecture supports Supabase Realtime (coming soon)

---

## 🚀 How to Use

### Saving & Sharing a Presentation

1. **Create your presentation** as usual
2. **Click "Save & Share"** button (purple gradient button next to Export)
3. **Sign in** if prompted (required for saving)
4. **Wait for save** - takes just a few seconds
5. **Share Modal opens** automatically with your link
6. **Copy the link** and share it with anyone!

### Viewing a Shared Presentation

1. **Open the shared link** (e.g., `https://yoursite.com/presentation/view/abc123`)
2. **View the presentation** - no sign-in required
3. **Create your own** by clicking "Create Your Own" button

### Using Flux AI Images

Images are generated automatically when you:
- Set **Image Source** to "AI Images" in settings
- Generate a presentation
- Images appear as slide backgrounds

**Customization:**
- **AI Model**: Choose Flux Fast or Flux Pro
- **Art Style**: Photorealistic, Illustration, Abstract, 3D, Line Art
- **Extra Keywords**: Add custom style keywords (e.g., "playful, sunlit")

---

## 🔧 Technical Details

### Architecture

```
┌─────────────────────────────────────────┐
│  RealTimeGenerator Component            │
│  ├─ Save & Share Button                 │
│  ├─ handleSavePresentation()            │
│  └─ Share Modal                          │
└─────────────────────────────────────────┘
                  ↓
┌─────────────────────────────────────────┐
│  API: /api/presentations (POST)         │
│  ├─ Validates auth token                │
│  ├─ Saves to Supabase 'documents' table │
│  └─ Returns presentation ID & share URL │
└─────────────────────────────────────────┘
                  ↓
┌─────────────────────────────────────────┐
│  Supabase Database                       │
│  Table: documents                        │
│  ├─ id (UUID)                            │
│  ├─ user_id (UUID)                       │
│  ├─ title (TEXT)                         │
│  ├─ type ('presentation')                │
│  ├─ content (JSONB)                      │
│  │   ├─ slides[]                         │
│  │   ├─ template                         │
│  │   └─ isPublic                         │
│  └─ created_at (TIMESTAMP)               │
└─────────────────────────────────────────┘
                  ↓
┌─────────────────────────────────────────┐
│  View Page: /presentation/view/[id]     │
│  ├─ Fetches from API                     │
│  ├─ Displays slides (read-only)         │
│  └─ Shows "Create Your Own" CTA         │
└─────────────────────────────────────────┘
```

### Data Flow

1. **User creates presentation** → Slides stored in React state
2. **User clicks "Save & Share"** → Sends slides to API
3. **API validates auth** → Checks Supabase session
4. **API saves to database** → Stores in `documents` table
5. **API returns share URL** → Format: `/presentation/view/{id}`
6. **Share Modal opens** → User can copy/share link
7. **Recipient opens link** → Fetches from API, displays slides

### Database Schema

```sql
-- documents table (already exists)
CREATE TABLE documents (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id),
  title TEXT NOT NULL,
  type TEXT NOT NULL, -- 'presentation', 'resume', etc.
  content JSONB NOT NULL,
  prompt TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Presentation content structure (JSONB)
{
  "slides": [
    {
      "slideNumber": 1,
      "type": "hero",
      "title": "My Presentation",
      "subtitle": "Subtitle here",
      "content": "Content here",
      "bullets": ["Point 1", "Point 2"],
      "imageUrl": "https://...",
      "design": {
        "background": "gradient-blue-purple"
      }
    }
  ],
  "template": "peach",
  "isPublic": true
}
```

---

## 🎨 Flux AI Integration

### How It Works

1. **Prompt Enhancement**: Each slide gets a custom prompt based on type
2. **Nebius API Call**: Uses OpenAI SDK format with Nebius endpoint
3. **Image Generation**: FLUX.1-schnell model creates 16:9 images
4. **URL Return**: Image URLs are stored in slide data

### Slide Type Prompts

| Slide Type | Prompt Enhancement |
|------------|-------------------|
| **Hero/Cover** | "Breathtaking hero image, stunning gradient, vibrant purple and blue tones, modern abstract shapes, cinematic lighting" |
| **Content** | "Beautiful abstract background, soft gradient overlay, modern geometric patterns, professional photography" |
| **Stats/Numbers** | "Bold data visualization background, vibrant gradient, modern abstract shapes, professional infographic style" |
| **Conclusion** | "Inspiring conclusion image, uplifting gradient background, warm vibrant colors, motivational atmosphere" |

### Configuration

```typescript
// In real-time-generator.tsx settings panel
imageSource: 'ai' | 'stock' | 'web'
imageModel: 'flux-fast' | 'flux-pro' | 'dalle'
artStyle: 'photorealistic' | 'illustration' | 'abstract' | '3d' | 'line-art'
extraKeywords: string // e.g., "playful, sunlit"
```

---

## 🔐 Security & Permissions

### Current Implementation

- **Public Sharing**: All saved presentations are public by default
- **Auth Required**: Must be signed in to save presentations
- **View Access**: Anyone with link can view (no auth needed)
- **Edit Access**: Only creator can edit (enforced by auth)

### Future Enhancements

```typescript
// Permission levels (coming soon)
type Permission = 'view' | 'comment' | 'edit' | 'admin';

interface ShareSettings {
  isPublic: boolean;
  allowedUsers: {
    userId: string;
    permission: Permission;
  }[];
  expiresAt?: Date;
  password?: string;
}
```

---

## 🚀 Roadmap

### Phase 1: ✅ Completed
- [x] Save presentations to Supabase
- [x] Generate share links
- [x] View-only presentation pages
- [x] Share modal with copy functionality
- [x] Flux AI image generation
- [x] Multiple art styles

### Phase 2: Real-time Collaboration (Next)
- [ ] Supabase Realtime integration
- [ ] Live cursor tracking
- [ ] Simultaneous editing
- [ ] Change notifications
- [ ] Conflict resolution

### Phase 3: Advanced Sharing
- [ ] Edit permissions
- [ ] Comment system
- [ ] Password protection
- [ ] Expiring links
- [ ] Email invitations
- [ ] Embed codes

### Phase 4: Team Features
- [ ] Workspaces
- [ ] Team libraries
- [ ] Brand kits
- [ ] Approval workflows
- [ ] Analytics dashboard

---

## 📝 API Reference

### POST /api/presentations

**Save a presentation**

```typescript
// Request
POST /api/presentations
Headers: {
  'Authorization': 'Bearer {token}',
  'Content-Type': 'application/json'
}
Body: {
  title: string;
  slides: Slide[];
  template: string;
  prompt: string;
  isPublic: boolean;
}

// Response
{
  id: string; // UUID
  shareUrl: string; // Full URL to view page
}
```

### GET /api/presentations/[id]

**Fetch a presentation**

```typescript
// Request
GET /api/presentations/{id}

// Response
{
  id: string;
  title: string;
  slides: Slide[];
  template: string;
  created_at: string;
  user_id: string;
}
```

---

## 🎯 Usage Examples

### Example 1: Save & Share

```typescript
// In RealTimeGenerator component
const handleSavePresentation = async () => {
  const supabase = createClient;
  const { data: { session } } = await supabase.auth.getSession();
  
  const response = await fetch('/api/presentations', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${session.access_token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      title: 'My Presentation',
      slides: slides,
      template: 'peach',
      isPublic: true
    })
  });
  
  const { id, shareUrl } = await response.json();
  // shareUrl: https://yoursite.com/presentation/view/abc-123
};
```

### Example 2: Generate Flux Images

```typescript
import { generateSlideImage } from '@/lib/flux-image-generator';

// Generate image for a hero slide
const imageUrl = await generateSlideImage(
  'hero',
  'The Future of AI',
  'Exploring artificial intelligence trends',
  '1024x576'
);

// Returns: https://api.tokenfactory.nebius.com/...
```

---

## 🐛 Troubleshooting

### "Please sign in to save presentations"
**Solution**: User must be authenticated. Implement sign-in flow or use Supabase auth.

### "Failed to save presentation"
**Possible causes:**
- Supabase credentials not configured
- Database table doesn't exist
- Network error

**Solution**: Check `.env` file for `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY`

### "Presentation not found"
**Possible causes:**
- Invalid presentation ID
- Presentation is private
- Presentation was deleted

**Solution**: Verify the share link is correct

### Flux images not generating
**Possible causes:**
- `NEBIUS_API_KEY` not set
- API rate limit exceeded
- Network error

**Solution**: Check `.env` for `NEBIUS_API_KEY` and verify API quota

---

## 🌟 Best Practices

### 1. **Naming Presentations**
- Use descriptive titles
- Include date or version if needed
- Keep it concise (max 60 characters)

### 2. **Sharing Links**
- Test the link before sharing
- Use URL shorteners for cleaner links
- Include context when sharing (email subject, message)

### 3. **Image Generation**
- Use specific keywords for better results
- Choose appropriate art style for your content
- Preview before finalizing

### 4. **Performance**
- Limit presentations to 20 slides for best performance
- Use "Flux Fast" for quicker generation
- Generate images in batches to avoid rate limits

---

## 📊 Analytics (Coming Soon)

Track presentation performance:
- **Views**: How many times your presentation was viewed
- **Engagement**: Average time spent per slide
- **Shares**: How many times the link was shared
- **Devices**: Desktop vs mobile viewers
- **Geography**: Where viewers are located

---

## 🔗 Related Documentation

- [Editable Presentations Guide](./EDITABLE_PRESENTATIONS.md)
- [Flux Image Generator](./lib/flux-image-generator.ts)
- [Supabase Setup](./SUPABASE_SETUP.md)
- [API Documentation](./API_DOCS.md)

---

## 💬 Support

Need help?
- **GitHub Issues**: Report bugs or request features
- **Discord**: Join our community for real-time help
- **Email**: support@docmagic.ai

---

**Made with ❤️ by the DocMagic Team**

*Last updated: December 2024*
