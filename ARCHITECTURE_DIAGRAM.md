# DocMagic Enhanced Editor Architecture

## System Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────────────┐
│                          USER INTERFACE LAYER                            │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                           │
│  ┌──────────────┐    ┌──────────────┐    ┌──────────────┐              │
│  │   Templates  │───▶│ Template Use │───▶│ Unified      │              │
│  │   Gallery    │    │    Page      │    │   Editor     │              │
│  │  /templates  │    │/templates/   │    │/editor/[type]│              │
│  │              │    │  [id]/use    │    │    /[id]     │              │
│  └──────────────┘    └──────────────┘    └──────┬───────┘              │
│                                                   │                       │
└───────────────────────────────────────────────────┼───────────────────────┘
                                                    │
┌───────────────────────────────────────────────────┼───────────────────────┐
│                      EDITOR COMPONENTS             │                       │
├────────────────────────────────────────────────────┼──────────────────────┤
│                                                    │                       │
│  ┌─────────────────────────────────────────────────▼─────────────┐       │
│  │                    Enhanced Editor Page                        │       │
│  │                                                                 │       │
│  │  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐        │       │
│  │  │ Left Sidebar │  │    Canvas    │  │Right Sidebar │        │       │
│  │  │              │  │              │  │              │        │       │
│  │  │ ┌──────────┐ │  │ ┌──────────┐ │  │ ┌──────────┐ │        │       │
│  │  │ │AI Enhance│ │  │ │ Visual   │ │  │ │Properties│ │        │       │
│  │  │ │  Panel   │ │  │ │ Editor   │ │  │ │  Panel   │ │        │       │
│  │  │ └──────────┘ │  │ │(Fabric.js│ │  │ └──────────┘ │        │       │
│  │  │              │  │ │  Canvas) │ │  │              │        │       │
│  │  │ ┌──────────┐ │  │ └──────────┘ │  │ ┌──────────┐ │        │       │
│  │  │ │  Design  │ │  │              │  │ │  Layers  │ │        │       │
│  │  │ │ Elements │ │  │ ┌──────────┐ │  │ │  Panel   │ │        │       │
│  │  │ └──────────┘ │  │ │  Pages   │ │  │ └──────────┘ │        │       │
│  │  │              │  │ │  Panel   │ │  │              │        │       │
│  │  │ ┌──────────┐ │  │ └──────────┘ │  │ ┌──────────┐ │        │       │
│  │  │ │  Icons   │ │  │              │  │ │Collabora-│ │        │       │
│  │  │ │ Library  │ │  │              │  │ │   tion   │ │        │       │
│  │  │ └──────────┘ │  │              │  │ │  Panel   │ │        │       │
│  │  │              │  │              │  │ └──────────┘ │        │       │
│  │  │ ┌──────────┐ │  │              │  │              │        │       │
│  │  │ │  Images  │ │  │              │  │              │        │       │
│  │  │ │ Library  │ │  │              │  │              │        │       │
│  │  │ └──────────┘ │  │              │  │              │        │       │
│  │  └──────────────┘  └──────────────┘  └──────────────┘        │       │
│  └─────────────────────────────────────────────────────────────┘       │
│                                                                           │
└───────────────────────────────────────────────────────────────────────────┘
                                    │
                    ┌───────────────┼───────────────┐
                    │               │               │
┌───────────────────▼──┐  ┌─────────▼────────┐  ┌──▼──────────────────┐
│   API LAYER          │  │  STATE MGMT      │  │  SERVICES           │
├──────────────────────┤  ├──────────────────┤  ├─────────────────────┤
│                      │  │                  │  │                     │
│ /api/ai/             │  │ useEditorStore() │  │ Collaboration       │
│   enhance-content    │  │                  │  │   Service           │
│                      │  │ - canvas         │  │                     │
│ /api/documents/      │  │ - selectedObject │  │ - createSession()   │
│   [id]               │  │ - pages          │  │ - joinSession()     │
│   - GET              │  │ - history        │  │ - broadcastChange() │
│   - PUT              │  │                  │  │ - subscribeToChanges│
│   - DELETE           │  │                  │  │                     │
│                      │  │                  │  │                     │
│ /api/documents/      │  │                  │  │                     │
│   create-from-       │  │                  │  │                     │
│   template           │  │                  │  │                     │
│                      │  │                  │  │                     │
└──────────┬───────────┘  └──────────────────┘  └─────────┬───────────┘
           │                                               │
           │                                               │
┌──────────▼───────────────────────────────────────────────▼───────────┐
│                     EXTERNAL SERVICES                                 │
├───────────────────────────────────────────────────────────────────────┤
│                                                                        │
│  ┌──────────────────┐  ┌──────────────────┐  ┌──────────────────┐   │
│  │   Supabase       │  │  Google Gemini   │  │  Supabase        │   │
│  │   Database       │  │      AI          │  │  Realtime        │   │
│  │                  │  │                  │  │                  │   │
│  │ ┌──────────────┐ │  │ ┌──────────────┐ │  │ ┌──────────────┐ │   │
│  │ │  documents   │ │  │ │ Text         │ │  │ │ Channels     │ │   │
│  │ │  table       │ │  │ │ Enhancement  │ │  │ │              │ │   │
│  │ └──────────────┘ │  │ └──────────────┘ │  │ └──────────────┘ │   │
│  │                  │  │                  │  │                  │   │
│  │ ┌──────────────┐ │  │ ┌──────────────┐ │  │ ┌──────────────┐ │   │
│  │ │  templates   │ │  │ │ Color        │ │  │ │ Presence     │ │   │
│  │ │  table       │ │  │ │ Schemes      │ │  │ │ Tracking     │ │   │
│  │ └──────────────┘ │  │ └──────────────┘ │  │ └──────────────┘ │   │
│  │                  │  │                  │  │                  │   │
│  │ ┌──────────────┐ │  │ ┌──────────────┐ │  │ ┌──────────────┐ │   │
│  │ │collaboration │ │  │ │ Layout       │ │  │ │ Broadcast    │ │   │
│  │ │  _sessions   │ │  │ │ Suggestions  │ │  │ │ Messages     │ │   │
│  │ └──────────────┘ │  │ └──────────────┘ │  │ └──────────────┘ │   │
│  │                  │  │                  │  │                  │   │
│  │ ┌──────────────┐ │  │                  │  │                  │   │
│  │ │    share     │ │  │                  │  │                  │   │
│  │ │ permissions  │ │  │                  │  │                  │   │
│  │ └──────────────┘ │  │                  │  │                  │   │
│  │                  │  │                  │  │                  │   │
│  └──────────────────┘  └──────────────────┘  └──────────────────┘   │
│                                                                        │
└────────────────────────────────────────────────────────────────────────┘
```

## Data Flow Diagrams

### 1. Template to Editor Flow

```
User Action                 System Response
───────────                 ───────────────

[Browse Templates]
      │
      ├──▶ GET /api/templates
      │         │
      │         └──▶ Fetch from Supabase
      │                   │
      │                   └──▶ Display Gallery
      │
[Click Template]
      │
      ├──▶ Navigate to /templates/[id]/use
      │         │
      │         └──▶ Fetch template details
      │                   │
      │                   └──▶ Show preview
      │
[Click "Use Template"]
      │
      ├──▶ POST /api/documents/create-from-template
      │         │
      │         ├──▶ Create document in DB
      │         │
      │         ├──▶ Initialize collaboration session
      │         │
      │         └──▶ Return document ID
      │
      └──▶ Navigate to /editor/[type]/[id]
                │
                ├──▶ Load document content
                │
                ├──▶ Initialize canvas
                │
                ├──▶ Join collaboration session
                │
                └──▶ Ready for editing!
```

### 2. Real-Time Collaboration Flow

```
User A                      Supabase Realtime              User B
──────                      ─────────────────              ──────

[Makes Edit]
    │
    ├──▶ Update Canvas
    │
    ├──▶ broadcastChange()
    │         │
    │         └──▶ [Channel: doc-123]
    │                     │
    │                     └──────────────────────▶ [Receive Change]
    │                                                      │
    │                                                      ├──▶ Apply to Canvas
    │                                                      │
    │                                                      └──▶ Show Update
    │
[Move Cursor]
    │
    ├──▶ broadcastCursor()
    │         │
    │         └──▶ [Channel: doc-123]
    │                     │
    │                     └──────────────────────▶ [Receive Cursor]
    │                                                      │
    │                                                      └──▶ Show Cursor
    │
[Auto-Save (30s)]
    │
    ├──▶ PUT /api/documents/[id]
    │         │
    │         ├──▶ Save to Database
    │         │
    │         └──▶ Broadcast save event
    │                     │
    │                     └──────────────────────▶ [Update Status]
```

### 3. AI Enhancement Flow

```
User Input                  API Processing                AI Response
──────────                  ──────────────                ───────────

[Type Prompt]
    │
    └──▶ "Improve my resume text"
              │
              ├──▶ POST /api/ai/enhance-content
              │         │
              │         ├──▶ Build context
              │         │    - Document type
              │         │    - Canvas data
              │         │    - Current content
              │         │
              │         ├──▶ Call Gemini AI
              │         │         │
              │         │         └──▶ Generate suggestions
              │         │
              │         ├──▶ Parse response
              │         │    - Extract colors
              │         │    - Extract tips
              │         │
              │         └──▶ Return formatted response
              │
              └──▶ Display in chat
                        │
                        ├──▶ Show suggestions
                        │
                        └──▶ Apply enhancements (optional)
```

## Component Hierarchy

```
UnifiedEditorPage
├── EnhancedEditorToolbar
│   ├── Text formatting controls
│   ├── Alignment tools
│   └── Style options
│
├── ActionBar
│   ├── Save button
│   ├── Export button
│   ├── Share button
│   └── Collaborate button
│
├── LeftSidebar (Tabs)
│   ├── AIEnhancementPanel
│   │   ├── Chat interface
│   │   ├── Quick actions
│   │   └── Message history
│   │
│   ├── DesignElementsPanel
│   │   ├── Shapes
│   │   ├── Text elements
│   │   └── Backgrounds
│   │
│   ├── IconLibraryPanel
│   │   └── Icon picker
│   │
│   └── ImageLibraryPanel
│       └── Image assets
│
├── CenterArea
│   ├── VisualEditor (Fabric.js Canvas)
│   │   ├── Canvas objects
│   │   ├── Selection handles
│   │   └── Collaboration cursors
│   │
│   └── PagesPanel
│       ├── Page thumbnails
│       └── Add/remove pages
│
└── RightSidebar (Conditional)
    ├── CollaborationPanel (when enabled)
    │   ├── Active participants
    │   ├── Share options
    │   └── Permission management
    │
    ├── PropertiesPanel
    │   ├── Object properties
    │   ├── Style controls
    │   └── Transform options
    │
    └── LayersPanel
        ├── Layer list
        ├── Visibility toggles
        └── Reorder controls
```

## Security Architecture

```
┌─────────────────────────────────────────────────────────┐
│                    Client Request                        │
└───────────────────────┬─────────────────────────────────┘
                        │
                        ▼
┌─────────────────────────────────────────────────────────┐
│              Authentication Check                        │
│         (Supabase Auth - JWT Token)                     │
└───────────────────────┬─────────────────────────────────┘
                        │
                        ├──▶ Invalid ──▶ 401 Unauthorized
                        │
                        ▼ Valid
┌─────────────────────────────────────────────────────────┐
│            Authorization Check                           │
│         (Row Level Security Policies)                    │
└───────────────────────┬─────────────────────────────────┘
                        │
                        ├──▶ No Permission ──▶ 403 Forbidden
                        │
                        ▼ Authorized
┌─────────────────────────────────────────────────────────┐
│              Process Request                             │
│         (API Logic + Business Rules)                     │
└───────────────────────┬─────────────────────────────────┘
                        │
                        ▼
┌─────────────────────────────────────────────────────────┐
│            Database Operation                            │
│         (Filtered by RLS Policies)                       │
└───────────────────────┬─────────────────────────────────┘
                        │
                        ▼
┌─────────────────────────────────────────────────────────┐
│              Return Response                             │
│         (200 OK with data)                              │
└─────────────────────────────────────────────────────────┘
```

## State Management Flow

```
┌──────────────────────────────────────────────────────────┐
│                  Zustand Store                            │
│              (useEditorStore)                             │
├──────────────────────────────────────────────────────────┤
│                                                           │
│  State:                                                   │
│  ├── canvas: fabric.Canvas                               │
│  ├── selectedObject: fabric.Object | null                │
│  ├── pages: Page[]                                        │
│  ├── history: HistoryState[]                             │
│  └── collaborators: Participant[]                        │
│                                                           │
│  Actions:                                                 │
│  ├── setCanvas(canvas)                                   │
│  ├── selectObject(object)                                │
│  ├── addPage()                                           │
│  ├── undo()                                              │
│  ├── redo()                                              │
│  └── updateCollaborators(participants)                   │
│                                                           │
└──────────────────────────────────────────────────────────┘
         │                    │                    │
         │                    │                    │
         ▼                    ▼                    ▼
┌──────────────┐    ┌──────────────┐    ┌──────────────┐
│  Components  │    │   Canvas     │    │ Collaboration│
│              │    │   Updates    │    │   Service    │
└──────────────┘    └──────────────┘    └──────────────┘
```

---

This architecture provides:
- ✅ **Scalability**: Modular components, easy to extend
- ✅ **Real-time**: Supabase Realtime for instant updates
- ✅ **Security**: RLS policies, auth checks at every layer
- ✅ **Performance**: Optimized queries, efficient state management
- ✅ **Maintainability**: Clear separation of concerns
