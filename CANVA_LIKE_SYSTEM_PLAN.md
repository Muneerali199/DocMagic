# Canva-Like Template & PPT Editor System - Implementation Plan

## Overview
Transform DocMagic into a comprehensive design platform with real-time customization, similar to Canva, with AI-powered assistance.

## Current State Analysis
✅ **What We Have:**
- Basic template system with CRUD operations
- AI-powered PPT generation
- Template preview and selection
- Export functionality (PDF, PPTX)

❌ **What's Missing:**
- Real-time visual editor with drag-and-drop
- Design elements library (shapes, icons, images)
- Advanced text styling (fonts, colors, effects)
- Layer management and positioning
- AI chat assistant for design modifications
- Live preview as you edit
- Collaborative features

---

## Phase 1: Enhanced Template Gallery 🎨
**Goal:** Create visually stunning template previews with categories

### Components to Build:
1. **Template Gallery v2** (`template-gallery-v2.tsx`)
   - Grid/List view toggle
   - Category filtering (Business, Creative, Minimal, Bold, etc.)
   - Live preview on hover
   - Quick actions (Use, Preview, Customize)
   - Template ratings and popularity
   - Search with AI-powered suggestions

2. **Template Preview Modal** (`template-preview-modal-v2.tsx`)
   - Full-screen preview
   - Zoom controls
   - Slide-by-slide navigation
   - Quick customization options

### Features:
- **10+ Categories**: Business, Creative, Education, Marketing, Startup, etc.
- **50+ Premium Templates**: Professional, pre-designed templates
- **Smart Filters**: By color scheme, industry, style, mood
- **Template Analytics**: Most used, trending, new

---

## Phase 2: Real-Time Visual Editor 🎯
**Goal:** Canva-like drag-and-drop editor with live preview

### Core Components:

#### 1. Main Editor (`visual-editor.tsx`)
```tsx
interface VisualEditorProps {
  initialSlides: Slide[];
  template: Template;
  onSave: (slides: Slide[]) => void;
  onExport: (format: 'ppt' | 'pdf') => void;
}
```

**Features:**
- Canvas with grid/guides
- Zoom controls (25% - 400%)
- Undo/Redo functionality
- Auto-save every 30 seconds
- Real-time collaboration indicators

#### 2. Toolbar (`editor-toolbar.tsx`)
- Text tools (Add text, heading, body, bullet)
- Shape tools (Rectangle, circle, triangle, line, arrow)
- Image tools (Upload, unsplash, AI-generated)
- Chart tools (Bar, pie, line, area)
- Icon library (1000+ icons)
- Elements library (patterns, gradients, textures)

#### 3. Properties Panel (`properties-panel.tsx`)
**Text Properties:**
- Font family (50+ fonts)
- Font size (8-500px)
- Font weight (Light, Regular, Medium, Bold, Black)
- Text color with color picker
- Background color
- Text alignment (left, center, right, justify)
- Line height
- Letter spacing
- Text effects (shadow, outline, gradient)

**Shape Properties:**
- Fill color (solid, gradient, pattern)
- Border color and width
- Border style (solid, dashed, dotted)
- Corner radius
- Opacity
- Rotation
- Shadow effects

**Position & Size:**
- X, Y coordinates
- Width, Height
- Lock aspect ratio
- Align tools (left, center, right, top, middle, bottom)
- Distribute tools

#### 4. Layers Panel (`layers-panel.tsx`)
- Show all elements in current slide
- Drag to reorder (z-index)
- Lock/unlock layers
- Show/hide layers
- Rename layers
- Group/ungroup elements

#### 5. Slide Navigator (`slide-navigator.tsx`)
- Thumbnail view of all slides
- Drag to reorder slides
- Duplicate slide
- Delete slide
- Add new slide
- Master slide templates

---

## Phase 3: Design Elements Library 📚

### Element Categories:

#### 1. Text Styles (`text-presets.ts`)
```typescript
export const textPresets = {
  headings: [
    { name: 'Bold Display', font: 'Inter', size: 72, weight: 'bold', color: '#000' },
    { name: 'Elegant Serif', font: 'Playfair Display', size: 64, weight: 'normal' },
    // ... 20+ presets
  ],
  body: [
    { name: 'Clean Sans', font: 'Inter', size: 18, weight: 'normal', lineHeight: 1.6 },
    // ... 15+ presets
  ],
  emphasis: [
    { name: 'Bold Call-out', font: 'Montserrat', size: 24, weight: 'bold', color: '#FF6B6B' },
    // ... 10+ presets
  ]
}
```

#### 2. Color Palettes (`color-palettes.ts`)
- **Professional** (10+ palettes)
- **Vibrant** (10+ palettes)
- **Pastel** (10+ palettes)
- **Monochrome** (5+ palettes)
- **Custom palette creator**

#### 3. Shape Library (`shapes-library.tsx`)
- Basic shapes (rect, circle, triangle, polygon)
- Arrows (50+ styles)
- Lines and connectors
- Callouts and speech bubbles
- Frames and borders
- Decorative elements

#### 4. Icon Library (`icon-library.tsx`)
- **Integration with Lucide Icons** (1000+ icons)
- **Categories**: Business, Technology, Social, Education, etc.
- **Search functionality**
- **Color customization**
- **Size presets**

#### 5. Image Library (`image-library.tsx`)
- **Unsplash Integration** (Search millions of photos)
- **AI Image Generation** (DALL-E or Stable Diffusion)
- **Stock photos by category**
- **User uploads**
- **Image filters and effects**

#### 6. Chart Templates (`chart-templates.tsx`)
```typescript
export const chartTemplates = {
  bar: ['Vertical', 'Horizontal', 'Stacked', 'Grouped'],
  line: ['Simple', 'Multi-line', 'Area', 'Stepped'],
  pie: ['Standard', 'Donut', 'Semi-circle', 'Exploded'],
  scatter: ['Basic', 'Bubble', 'Connected'],
  mixed: ['Combo charts'],
}
```

---

## Phase 4: AI Design Assistant 🤖

### Component: `ai-design-assistant.tsx`

#### Features:

##### 1. Chat Interface
```tsx
interface AICommand {
  type: 'create' | 'modify' | 'suggest' | 'enhance';
  target: 'slide' | 'element' | 'presentation';
  action: string;
}
```

**Example Commands:**
- "Create a title slide with our company logo"
- "Make this text bigger and blue"
- "Add a chart showing Q4 sales data"
- "Suggest a better color scheme"
- "Redesign this slide in a modern style"
- "Add 3 bullet points about our services"
- "Change background to gradient"

##### 2. Smart Suggestions
- **Layout suggestions**: "Try these layouts for this content"
- **Color harmony**: "These colors work better together"
- **Typography**: "This font pairing improves readability"
- **Content ideas**: "Add these elements to make it pop"

##### 3. One-Click Enhancements
- "Improve this slide" → AI applies best practices
- "Make it professional" → Applies business template
- "Make it creative" → Applies creative design
- "Fix alignment" → Auto-aligns all elements
- "Balance composition" → Distributes elements evenly

##### 4. Content Generation
- "Generate content for introduction slide"
- "Write 5 benefits of our product"
- "Create speaker notes for this slide"
- "Suggest images for this topic"

##### 5. Smart Actions
```typescript
const aiActions = {
  // Slide creation
  createSlide: (type: 'title' | 'content' | 'image' | 'chart' | 'comparison') => {},
  
  // Element manipulation
  modifyElement: (element: Element, instruction: string) => {},
  
  // Design suggestions
  suggestLayout: (content: Content) => Layout[],
  suggestColors: (current: ColorPalette) => ColorPalette[],
  suggestFonts: (style: 'professional' | 'creative' | 'minimal') => FontPair[],
  
  // Content enhancement
  improveText: (text: string, tone: Tone) => string,
  generateContent: (topic: string, length: number) => string,
  
  // Smart positioning
  autoAlign: (elements: Element[]) => void,
  smartDistribute: (elements: Element[]) => void,
}
```

---

## Phase 5: Advanced Features 🚀

### 1. Animation & Transitions
- **Slide transitions**: Fade, slide, zoom, flip
- **Element animations**: Entrance, emphasis, exit
- **Timing controls**: Duration, delay, easing
- **Animation presets**: Smooth, bouncy, fast, slow

### 2. Master Slides & Themes
```typescript
interface MasterSlide {
  id: string;
  name: string;
  layouts: Layout[];
  placeholders: Placeholder[];
  theme: {
    colors: ColorPalette;
    fonts: FontTheme;
    effects: EffectPresets;
  };
}
```

### 3. Collaboration Features
- **Real-time editing**: Multiple users
- **Comments**: On slides and elements
- **Version history**: Track changes
- **Share & permissions**: View, comment, edit

### 4. Smart Templates
```typescript
interface SmartTemplate {
  id: string;
  category: string;
  preview: string;
  slides: Slide[];
  adaptiveLayouts: boolean; // Auto-adjusts to content
  aiGenerated: boolean;
  variables: TemplateVariable[]; // Customizable parts
}
```

---

## Phase 6: Export & Sharing 💾

### Export Options:
1. **PowerPoint (.pptx)**
   - Full fidelity export
   - Preserve animations
   - Editable in PowerPoint

2. **PDF**
   - High-quality export
   - Print-ready
   - Notes and handouts

3. **Images**
   - PNG, JPEG
   - Individual slides or all
   - Custom resolution

4. **Video**
   - MP4 export
   - With animations
   - Custom duration per slide

5. **Web**
   - Shareable link
   - Embed code
   - Password protection

### Sharing Features:
- **Public link**: Anyone with link can view
- **Private share**: Email-specific access
- **Embed**: Iframe for websites
- **Social**: Share preview on social media
- **Download**: Allow viewers to download

---

## Technical Architecture

### State Management:
```typescript
interface EditorState {
  presentation: {
    id: string;
    title: string;
    slides: Slide[];
    theme: Theme;
    metadata: Metadata;
  };
  
  currentSlide: number;
  selectedElements: string[];
  clipboard: Element[];
  history: HistoryItem[];
  historyIndex: number;
  
  ui: {
    zoom: number;
    showGrid: boolean;
    showRulers: boolean;
    showGuides: boolean;
    activePanel: 'elements' | 'design' | 'ai' | 'layers';
  };
  
  collaboration: {
    users: User[];
    cursor: UserCursor[];
    changes: Change[];
  };
}
```

### Data Models:
```typescript
interface Slide {
  id: string;
  type: SlideType;
  layout: Layout;
  elements: Element[];
  background: Background;
  transition: Transition;
  notes: string;
  metadata: SlideMetadata;
}

interface Element {
  id: string;
  type: 'text' | 'shape' | 'image' | 'chart' | 'icon';
  position: { x: number; y: number };
  size: { width: number; height: number };
  rotation: number;
  opacity: number;
  zIndex: number;
  locked: boolean;
  hidden: boolean;
  properties: ElementProperties;
  animations: Animation[];
}

interface ElementProperties {
  // Type-specific properties
  text?: TextProperties;
  shape?: ShapeProperties;
  image?: ImageProperties;
  chart?: ChartProperties;
  icon?: IconProperties;
}
```

---

## Implementation Priority

### Week 1-2: Foundation
- [ ] Enhanced template gallery
- [ ] Template preview modal
- [ ] Template categorization
- [ ] Search and filters

### Week 3-4: Visual Editor Core
- [ ] Canvas with zoom/pan
- [ ] Element selection and manipulation
- [ ] Basic toolbar (text, shapes, images)
- [ ] Properties panel
- [ ] Slide navigator

### Week 5-6: Design Elements
- [ ] Text presets and fonts
- [ ] Color palettes
- [ ] Shape library
- [ ] Icon library
- [ ] Image integration (Unsplash)

### Week 7-8: AI Assistant
- [ ] Chat interface
- [ ] Command parsing
- [ ] Smart suggestions
- [ ] Content generation
- [ ] Auto-enhancements

### Week 9-10: Advanced Features
- [ ] Layers panel
- [ ] Undo/redo system
- [ ] Animations & transitions
- [ ] Master slides
- [ ] Templates with variables

### Week 11-12: Polish & Export
- [ ] Export formats (PPTX, PDF, PNG)
- [ ] Sharing features
- [ ] Collaboration basics
- [ ] Performance optimization
- [ ] Testing & bug fixes

---

## Technology Stack

### Frontend:
- **React** with TypeScript
- **Fabric.js** or **Konva.js** for canvas manipulation
- **React DnD** for drag-and-drop
- **Framer Motion** for animations
- **Zustand** for state management
- **TailwindCSS** for styling

### AI Integration:
- **Gemini 2.0 Flash** for text generation
- **Mistral Large** for suggestions
- **OpenAI GPT-4** for advanced reasoning (optional)

### Libraries:
- **pptxgenjs** for PowerPoint export
- **jsPDF** for PDF export
- **html2canvas** for screenshots
- **react-color** for color pickers
- **react-fontpicker** for font selection

---

## Success Metrics

### User Experience:
- ✅ Create presentation in < 5 minutes
- ✅ AI assistant responds in < 2 seconds
- ✅ Real-time preview with no lag
- ✅ Export to PPTX in < 10 seconds

### Features:
- ✅ 50+ professional templates
- ✅ 1000+ icons and elements
- ✅ 100+ font options
- ✅ 50+ color palettes
- ✅ AI understands 95% of commands

### Performance:
- ✅ Load editor in < 2 seconds
- ✅ Handle 100+ slides smoothly
- ✅ Support 1000+ elements per slide
- ✅ Auto-save every 30 seconds

---

## Next Steps

1. **Review this plan** with your team
2. **Prioritize features** based on user needs
3. **Set up development environment**
4. **Start with Phase 1** (Template Gallery)
5. **Iterate based on feedback**

---

**Created by:** GitHub Copilot
**Date:** October 3, 2025
**Status:** 🚀 Ready to implement!
