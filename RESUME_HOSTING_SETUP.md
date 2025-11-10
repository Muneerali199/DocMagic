# Resume Hosting & Subdomain Feature Setup

## Overview
This document outlines the new resume/CV hosting feature that allows users to publish their resumes online with free subdomains or custom domains (premium).

## Features Implemented

### 1. Initial Resume/CV Selection
- **Location**: `components/resume/mobile-resume-builder.tsx`
- Users now see a selection screen when they first visit the resume builder
- Two options:
  - **Resume**: 1-page format, perfect for job applications
  - **CV**: 2+ pages, for academic and detailed profiles
- Clear descriptions and benefits for each option

### 2. Subdomain Publishing System
- **Free Feature**: Every user gets one free subdomain
- **Format**: `username.docmagic.app`
- **Features**:
  - Publish resume/CV online
  - Copy URL to clipboard
  - Open in new tab
  - Change subdomain anytime

### 3. Custom Domain (Premium)
- **Premium Feature**: Users can connect their own domain
- **Format**: `www.yourdomain.com`
- **Benefits**:
  - Professional branding
  - Remove DocMagic branding
  - Advanced analytics
  - Priority support

### 4. Public Resume Viewer
- **Route**: `/r/[subdomain]`
- **Features**:
  - Clean, professional display
  - Mobile responsive
  - SEO optimized
  - Call-to-action to create own resume

## Database Schema Required

You need to create a `published_resumes` table in Supabase:

```sql
-- Create published_resumes table
CREATE TABLE IF NOT EXISTS published_resumes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  subdomain TEXT NOT NULL UNIQUE,
  custom_domain TEXT UNIQUE,
  resume_data JSONB NOT NULL,
  is_cv BOOLEAN DEFAULT false,
  is_premium BOOLEAN DEFAULT false,
  views_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, subdomain)
);

-- Create index for faster subdomain lookups
CREATE INDEX idx_published_resumes_subdomain ON published_resumes(subdomain);
CREATE INDEX idx_published_resumes_user_id ON published_resumes(user_id);
CREATE INDEX idx_published_resumes_custom_domain ON published_resumes(custom_domain);

-- Enable Row Level Security
ALTER TABLE published_resumes ENABLE ROW LEVEL SECURITY;

-- Policy: Users can insert their own resumes
CREATE POLICY "Users can insert own resumes"
  ON published_resumes
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Policy: Users can update their own resumes
CREATE POLICY "Users can update own resumes"
  ON published_resumes
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);

-- Policy: Users can delete their own resumes
CREATE POLICY "Users can delete own resumes"
  ON published_resumes
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Policy: Anyone can view published resumes
CREATE POLICY "Anyone can view published resumes"
  ON published_resumes
  FOR SELECT
  TO public
  USING (true);
```

## API Endpoints

### POST /api/resume/publish
Publishes a resume to a subdomain.

**Request Body**:
```json
{
  "subdomain": "johnsmith",
  "resumeData": { /* resume object */ },
  "isCV": false
}
```

**Response**:
```json
{
  "success": true,
  "data": {
    "subdomain": "johnsmith",
    "url": "https://johnsmith.docmagic.app"
  }
}
```

### GET /api/resume/publish?subdomain=johnsmith
Retrieves a published resume by subdomain.

**Response**:
```json
{
  "success": true,
  "data": {
    "resume_data": { /* resume object */ },
    "is_cv": false,
    "updated_at": "2025-10-22T13:48:00Z"
  }
}
```

## User Flow

1. **Selection**: User chooses Resume or CV
2. **Input**: User imports/creates their resume
3. **Preview**: User reviews and edits
4. **Publish**: User clicks "Publish Online (Free)"
5. **Subdomain**: User enters desired subdomain
6. **Live**: Resume is published at `subdomain.docmagic.app`
7. **Share**: User can copy URL and share

## Premium Upgrade Path

When users want custom domains:
1. Click "Upgrade to Premium" in dialog
2. Redirect to pricing page
3. After payment, enable custom domain feature
4. User enters their domain
5. System provides DNS instructions
6. Verify domain ownership
7. Resume goes live on custom domain

## DNS Configuration for Custom Domains

For custom domains to work, users need to add:

**CNAME Record**:
```
Type: CNAME
Name: www (or @)
Value: resumes.docmagic.app
TTL: 3600
```

## Next Steps

1. **Run the SQL schema** in your Supabase database
2. **Test subdomain publishing** with a test user
3. **Set up DNS** for custom domain support (future)
4. **Add analytics** to track resume views
5. **Implement premium features** (payment integration)

## Files Modified/Created

### Modified:
- `components/resume/mobile-resume-builder.tsx` - Added selection screen, subdomain UI
- `components/resume/resume-preview.tsx` - Added ref support, CV/Resume logic

### Created:
- `app/api/resume/publish/route.ts` - API for publishing resumes
- `app/r/[subdomain]/page.tsx` - Public resume viewer
- `RESUME_HOSTING_SETUP.md` - This documentation

## Testing Checklist

- [ ] Initial Resume/CV selection works
- [ ] Subdomain validation (lowercase, alphanumeric, hyphens)
- [ ] Subdomain uniqueness check
- [ ] Resume publishes successfully
- [ ] Public URL loads correctly
- [ ] Copy URL to clipboard works
- [ ] Open in new tab works
- [ ] Change subdomain works
- [ ] Dark mode compatibility
- [ ] Mobile responsiveness
- [ ] SEO meta tags (add later)

## Future Enhancements

1. **Analytics Dashboard**: Track views, clicks, downloads
2. **QR Code**: Generate QR code for resume URL
3. **Custom Themes**: Let users customize colors/fonts
4. **Password Protection**: Private resume option
5. **Expiry Dates**: Auto-unpublish after date
6. **Multiple Resumes**: Different resumes for different roles
7. **A/B Testing**: Test different resume versions
8. **Integration**: LinkedIn, Indeed, etc.
