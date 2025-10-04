# Phase 3 — Design Elements Library (Initial Implementation)

Date: October 4, 2025

This file documents the initial Phase 3 work I implemented (Design Elements Library) and how to test it locally.

## What I implemented

1. Image Library
   - New component: `components/editor/image-library-panel.tsx`
   - Supports:
     - Unsplash-style placeholder searches via `source.unsplash.com` (no API key).
     - Local image upload (drag/select files) and adds uploaded images to the Fabric canvas.
   - Integrated into editor as a left-sidebar tab (Images).

2. Design Elements Wiring
   - `components/editor/design-elements-panel.tsx` was updated to use shared data from `lib/template-data.ts`:
     - Text presets are fed from `textPresets` in `lib/template-data.ts`.
     - Color palettes are sourced from `colorPalettes` in `lib/template-data.ts`.
   - Shapes, Charts, and Layouts UI exist and are wired to add basic placeholders to the canvas.

3. Icon Library
   - `components/editor/icon-library-panel.tsx` existed and is available under the Icons tab.
   - Clicking an icon adds a small placeholder group to the canvas.

4. Editor Integration
   - `app/editor/page.tsx` was updated to include the Images tab alongside Elements and Icons.

## New/Updated files

- Added: `components/editor/image-library-panel.tsx` — Image search/upload + add-to-canvas
- Updated: `components/editor/design-elements-panel.tsx` — wired to `lib/template-data.ts`
- Updated: `app/editor/page.tsx` — added Images tab

## How to test locally

1. Start dev server

```powershell
cd "c:\Users\Muneer Ali Subzwari\Desktop\docmagic\DocMagic"
npm install   # only if dependencies not up-to-date
npm run dev
```

2. Open the editor

- Visit `http://localhost:3000/editor`
- Left sidebar shows tabs: Elements, Icons, Images

3. Elements tab
- Try "Text" presets: click a preset to add editable text to canvas.
- Try "Shapes" tab: click shapes to add them.
- Try "Colors" tab: click a palette color or "Apply Palette".

4. Icons tab
- Click an icon to add a placeholder icon group to the canvas.

5. Images tab
- Use the search box and press "Refresh" to generate Unsplash-like placeholders.
- Click an image to add it to the canvas.
- Use "Upload" to select local images and verify they are added.

## Lint & Notes

- I ran `npm run lint` — there are multiple pre-existing lint errors across the repo (react/no-unescaped-entities, parsing issues in `components/diagram/diagram-templates.tsx`, and some `img` usage in other components). These were not introduced by this Phase 3 work. I avoided making large repo-wide lint changes.

- If you want me to continue, I can:
  - Fix the `components/diagram/diagram-templates.tsx` parsing error (recommended — it may block builds).
  - Triage and fix the `react/no-unescaped-entities` issues incrementally.
  - Add tests for the new panels (unit tests or simple integration smoke tests).

## Next recommended steps (I can implement)

1. Fix the parsing error in `components/diagram/diagram-templates.tsx` (likely a malformed JSX/JS string).
2. Add a tiny integration test that mounts `DesignElementsPanel` and `ImageLibraryPanel` and verifies adding an element calls Fabric methods (mocked Fabric). I can add a Jest test and a basic mock for `fabric`.
3. Improve the Unsplash results (pagination, proper unique URLs) and cache images to avoid many re-fetches.

---

If you'd like, I can proceed with step 1 (parsing error) now — tell me to continue and I'll start fixing it and running lint/build until green or until I hit a blocking issue.
