# Enhanced Editor Features

## Overview
The DocMagic editor has been significantly enhanced with real-time collaboration, AI-powered content enhancement, and seamless template integration.

## Key Features

### 1. **Unified Editor** (`/editor/[type]/[id]`)
A single, powerful editor that handles all document types:
- **Resume** editing
- **Presentation** creation
- **CV** customization
- **Letter** writing
- **Website** building

#### Features:
- ✅ Real-time auto-save (every 30 seconds)
- ✅ Manual save with visual feedback
- ✅ Export to PNG/PDF
- ✅ Share and collaborate
- ✅ Template-based initialization

### 2. **Real-Time Collaboration**
Built on Supabase Realtime for seamless multi-user editing:

#### Collaboration Features:
- **Live Presence**: See who's currently viewing/editing
- **Cursor Tracking**: View other users' cursor positions in real-time
- **Change Broadcasting**: All edits sync instantly across users
- **Permission Levels**:
  - `owner`: Full control (create, edit, delete, share)
  - `editor`: Can edit content
  - `viewer`: Read-only access

#### How to Use:
1. Click the **"Collaborate"** button in the editor toolbar
2. Share via:
   - **Email invitation** with permission level
   - **Direct link** for quick sharing
3. See active collaborators in the right sidebar
4. Watch real-time cursors and edits

### 3. **AI Enhancement Panel**
Powered by Google Gemini AI for intelligent content improvement:

#### AI Capabilities:
- **Text Improvement**: Enhance clarity, professionalism, and impact
- **Color Schemes**: Get modern, accessible color palette suggestions
- **Layout Optimization**: Receive design hierarchy recommendations
- **Creative Elements**: Suggestions for icons, shapes, and visual elements

#### Quick Actions:
- 🎨 **Improve Text**: Make content more professional
- 🌈 **Color Scheme**: Get modern color suggestions
- 📐 **Layout Ideas**: Optimize visual hierarchy
- ✨ **Add Elements**: Creative enhancement suggestions

#### How to Use:
1. Open the **AI Enhance** tab in the left sidebar
2. Use quick action buttons or type custom requests
3. AI analyzes your document and provides specific suggestions
4. Enhancements are applied automatically or manually

### 4. **Template Integration**
Seamless workflow from template selection to editing:

#### Workflow:
1. **Browse Templates** (`/templates`)
   - View professional templates by category
   - Preview template designs
   
2. **Select Template** (`/templates/[id]/use`)
   - View template details
   - Click "Use This Template"
   
3. **Create Document**
   - System creates a new document from template
   - Automatically opens in unified editor
   
4. **Edit & Collaborate**
   - Full editor features available
   - Real-time collaboration enabled
   - AI enhancement ready

### 5. **Document Persistence**
All changes are automatically saved to Supabase:

#### Database Schema:
```sql
documents (
  id: UUID (primary key)
  user_id: UUID (foreign key to auth.users)
  title: TEXT
  type: TEXT (resume|presentation|cv|letter|website)
  content: JSONB (canvas data)
  template_id: UUID (optional, references templates)
  created_at: TIMESTAMPTZ
  updated_at: TIMESTAMPTZ
)
```

#### Features:
- Auto-save every 30 seconds
- Manual save option
- Version history (via updated_at)
- Template lineage tracking

## API Endpoints

### Document Management
- `GET /api/documents/[id]` - Fetch document
- `PUT /api/documents/[id]` - Update document
- `DELETE /api/documents/[id]` - Delete document
- `POST /api/documents/create-from-template` - Create from template

### AI Enhancement
- `POST /api/ai/enhance-content` - Get AI suggestions
  ```json
  {
    "prompt": "Improve my resume text",
    "documentType": "resume",
    "documentId": "uuid",
    "canvasData": {...},
    "context": {
      "objectCount": 10,
      "hasText": true,
      "hasImages": false
    }
  }
  ```

## Component Architecture

### Main Components
```
app/editor/[type]/[id]/page.tsx
├── EnhancedEditorToolbar (Top toolbar)
├── Left Sidebar
│   ├── AIEnhancementPanel (AI suggestions)
│   ├── DesignElementsPanel (Shapes, text)
│   ├── IconLibraryPanel (Icon picker)
│   └── ImageLibraryPanel (Image assets)
├── VisualEditor (Canvas area)
├── PagesPanel (Bottom page navigation)
└── Right Sidebar
    ├── CollaborationPanel (When enabled)
    ├── PropertiesPanel (Element properties)
    └── LayersPanel (Layer management)
```

### Key Services
- `collaboration-service.ts` - Real-time collaboration logic
- `editor-store.ts` - Zustand store for editor state
- `supabase/client.ts` - Supabase client configuration

## Usage Examples

### Starting from a Template
```typescript
// User clicks "Use Template" on template page
// System creates new document
const response = await fetch('/api/documents/create-from-template', {
  method: 'POST',
  body: JSON.stringify({
    templateId: 'template-uuid',
    type: 'resume',
    title: 'My Resume'
  })
});

// Redirect to editor
router.push(`/editor/resume/${newDocument.id}`);
```

### Collaborating in Real-Time
```typescript
// Initialize collaboration
const session = await collaborationService.createSession(
  documentId,
  'resume',
  userId
);

// Subscribe to changes
collaborationService.subscribeToChanges(
  documentId,
  onDocumentChange,
  onCursorMove,
  onParticipantJoin,
  onParticipantLeave
);

// Broadcast changes
await collaborationService.broadcastChange({
  session_id: sessionId,
  user_id: userId,
  change_type: 'update',
  path: 'canvas',
  new_value: canvasData
});
```

### Using AI Enhancement
```typescript
// Send AI request
const response = await fetch('/api/ai/enhance-content', {
  method: 'POST',
  body: JSON.stringify({
    prompt: 'Suggest a modern color scheme',
    documentType: 'presentation',
    canvasData: canvas.toJSON()
  })
});

// Apply suggestions
const { response: aiText, enhancements } = await response.json();
if (enhancements?.colors) {
  applyColorScheme(enhancements.colors);
}
```

## Environment Variables Required

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key

# AI Enhancement
GEMINI_API_KEY=your_gemini_api_key
```

## Database Setup

Run the migration to create necessary tables:
```bash
# Apply migration
supabase db push

# Or manually run
psql -f supabase/migrations/20250122000000_add_documents_table.sql
```

## Security Features

### Row Level Security (RLS)
- Users can only access their own documents
- Shared documents respect permission levels
- All queries are automatically filtered by RLS policies

### Permission Levels
- **Owner**: Full control
- **Editor**: Can edit but not delete
- **Viewer**: Read-only access

### Data Protection
- All API routes require authentication
- Document access is validated on every request
- Collaboration sessions are user-scoped

## Performance Optimizations

1. **Auto-save Throttling**: Saves every 30 seconds, not on every change
2. **Optimistic Updates**: UI updates immediately, syncs in background
3. **Indexed Queries**: Database indexes on user_id, type, created_at
4. **Canvas Serialization**: Efficient JSON storage of canvas state

## Future Enhancements

- [ ] Version history with rollback
- [ ] Comments and annotations
- [ ] Video chat integration
- [ ] Advanced AI features (auto-layout, smart suggestions)
- [ ] Export to more formats (DOCX, PPTX)
- [ ] Offline mode with sync
- [ ] Mobile-optimized editor

## Troubleshooting

### Common Issues

**Issue**: Collaboration not working
- Check Supabase Realtime is enabled
- Verify RLS policies are correct
- Ensure user is authenticated

**Issue**: AI suggestions not appearing
- Verify GEMINI_API_KEY is set
- Check API rate limits
- Review console for errors

**Issue**: Auto-save failing
- Check network connectivity
- Verify user has edit permissions
- Review Supabase logs

## Support

For issues or questions:
1. Check the console for error messages
2. Review Supabase logs
3. Verify environment variables
4. Check database migrations are applied

---

**Built with**: Next.js 14, Supabase, Fabric.js, Google Gemini AI, Tailwind CSS
