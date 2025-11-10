# 🐛 Debugging Guide - Template Opening Issue

## Problem
Templates not opening in editor when clicked from template gallery.

## Debugging Steps

### Step 1: Check Browser Console
1. Open browser DevTools (F12)
2. Go to Console tab
3. Click on a template
4. Look for these logs:
   - `Template ID received: [template-id]`
   - `Template found: [template object]`
   - `Setting resume data: [resume object]`

### Step 2: Check URL
When you click a template, the URL should change to:
```
http://localhost:3000/resume?template=software-engineering-resume
```

If the URL doesn't change:
- Check browser console for navigation errors
- Try using `useRouter` instead of `window.location.href`

### Step 3: Check Template ID
The template ID in the URL must match exactly with IDs in `lib/resume-template-data.ts`:
- `software-engineering-resume` ✅
- `nit-patna-resume` ✅
- `deedy-resume` ✅
- `autocv-resume` ✅
- `altacv-resume` ✅

### Step 4: Test Direct Navigation
Try navigating directly to:
```
http://localhost:3000/resume?template=software-engineering-resume
```

If this works, the issue is in the template gallery click handler.
If this doesn't work, the issue is in the resume page.

### Step 5: Check Network Tab
1. Open DevTools → Network tab
2. Click on a template
3. Look for the navigation request
4. Check if there are any failed requests

## Quick Fixes

### Fix 1: Use Next.js Router
Replace `window.location.href` with Next.js router:

```typescript
import { useRouter } from 'next/navigation';

const router = useRouter();

const handleUseTemplate = (e: React.MouseEvent) => {
  e.stopPropagation();
  if (template.type === 'resume') {
    router.push(`/resume?template=${encodeURIComponent(template.id)}`);
  }
};
```

### Fix 2: Add Loading State
Show a loading indicator while navigating:

```typescript
const [isNavigating, setIsNavigating] = useState(false);

const handleUseTemplate = async (e: React.MouseEvent) => {
  e.stopPropagation();
  setIsNavigating(true);
  
  if (template.type === 'resume') {
    router.push(`/resume?template=${encodeURIComponent(template.id)}`);
  }
};
```

### Fix 3: Ensure Template Data Loads
Add this to MobileResumeBuilder:

```typescript
useEffect(() => {
  console.log('=== TEMPLATE LOADING DEBUG ===');
  console.log('Template ID:', templateId);
  console.log('All Templates:', RESUME_TEMPLATES.map(t => t.id));
  
  if (templateId) {
    const template = RESUME_TEMPLATES.find(t => t.id === templateId);
    console.log('Found Template:', template);
    
    if (!template) {
      console.error('❌ Template not found!');
      console.log('Available IDs:', RESUME_TEMPLATES.map(t => t.id));
    }
  }
}, [templateId]);
```

## Common Issues

### Issue 1: Template ID Mismatch
**Symptom**: Console shows "Template not found"
**Solution**: Check that template IDs match exactly (case-sensitive)

### Issue 2: useSearchParams Not Working
**Symptom**: templateId is always null
**Solution**: Wrap in Suspense boundary (already done)

### Issue 3: Page Not Re-rendering
**Symptom**: Template loads but UI doesn't update
**Solution**: Check that `currentStep` is set to 'preview'

### Issue 4: Resume Data Not Editable
**Symptom**: Can see resume but can't edit
**Solution**: Check ResumePreview component has edit handlers

## Testing Checklist

- [ ] Click template from gallery
- [ ] URL changes to `/resume?template=...`
- [ ] Console shows "Template ID received"
- [ ] Console shows "Template found"
- [ ] Console shows "Setting resume data"
- [ ] Toast notification appears
- [ ] Resume preview shows
- [ ] Can click to edit sections
- [ ] Changes save properly

## Manual Test

1. **Start dev server**:
   ```bash
   npm run dev
   ```

2. **Open browser to**:
   ```
   http://localhost:3000/templates
   ```

3. **Click "Software Engineering Resume"**

4. **Expected behavior**:
   - URL changes to `/resume?template=software-engineering-resume`
   - Loading screen appears briefly
   - Resume editor loads with sample data
   - Toast shows "✨ Template Loaded!"
   - Can click sections to edit

5. **If it doesn't work**:
   - Check browser console
   - Look for error messages
   - Check Network tab for failed requests
   - Try direct URL navigation

## Alternative Solution: Client-Side Routing

If all else fails, use client-side state management:

```typescript
// In template gallery
import { useRouter } from 'next/navigation';

const router = useRouter();

const handleUseTemplate = (e: React.MouseEvent) => {
  e.stopPropagation();
  
  // Store template in localStorage
  localStorage.setItem('selectedTemplate', JSON.stringify(template));
  
  // Navigate
  router.push('/resume');
};

// In resume page
useEffect(() => {
  const storedTemplate = localStorage.getItem('selectedTemplate');
  if (storedTemplate) {
    const template = JSON.parse(storedTemplate);
    // Load template
    localStorage.removeItem('selectedTemplate');
  }
}, []);
```

## Need More Help?

Check these files:
- `components/templates/resume-template-gallery.tsx` - Template gallery
- `app/resume/page.tsx` - Resume page
- `components/resume/mobile-resume-builder.tsx` - Resume builder
- `lib/resume-template-data.ts` - Template data

Look for console.log statements to trace the flow!
