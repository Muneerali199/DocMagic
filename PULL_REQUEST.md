# Pull Request: Document Analytics Dashboard Implementation

## Description

This PR implements a comprehensive Document Analytics Dashboard for DraftDeckAI. The goal is to provide users with actionable insights into how their documents (Resumes, Presentations, and Generated Docs) are being viewed and engaged with, while ensuring privacy through anonymized IP hashing.

Fixes #107

## Type of Change

- [x] New feature (e.g., new page, component, or functionality)
- [x] UI/UX improvement (design, layout, or styling updates)
- [x] Performance optimization (e.g., code splitting, caching)

## Changes Made

- **Analytics Engine**: Implemented `document_views` and `document_engagement` tracking in Supabase with high-performance RPC aggregation.
- **Visual Dashboard**: Created a new `/dashboard/analytics` route featuring:
    - Interactive **Trend Charts** using Recharts.
    - GitHub-style **Activity Heatmaps** for engagement intensity.
    - **Engagement Log** with luxury-style activity badges.
    - **Edit Timeline** for document modification history.
- **Smart Suggestions**: Developed a heuristic-based engine that offers improvement tips (e.g., "Add more sections" or "Improve visual density") without external AI costs.
- **Instrumentation**: Integrated the `useDocumentAnalytics` hook into the Resume Editor, Presentation Studio, and Document Generator.
- **Migration Stability**: Fixed legacy database migration errors related to `uuid_generate_v4()` and duplicate RLS policy exceptions, ensuring the project is production-ready.

## Dependencies

- `recharts`: Added for interactive data visualization.
- `framer-motion`: Utilized for premium dashboard transitions and animations.

## Add Screenshots
*(Please attach screenshots of the new Analytics Dashboard and the History Dashboard "View Analytics" buttons here)*

## Checklist

- [x] My code follows the style guidelines of this project.
- [x] I have tested my changes across major browsers/devices.
- [x] I have tested my changes in development mode (`npm run dev`).
- [x] This is already assigned Issue to me, not an unassigned issue.
