# Migration Plan: Vercel/Supabase to Firebase Hosting/Auth with Supabase Database

## Overview
This document outlines the migration of DraftDeckAI from Vercel hosting and Supabase Authentication to Firebase Hosting and Firebase Authentication while retaining Supabase for database storage.

## Why This Approach?
- Addresses Vercel hosting performance concerns
- Fixes Supabase Google authentication token issues
- Maintains existing Supabase database schema and relationships
- Minimizes disruption to existing codebase
- Preserves referral system and other Supabase-specific features

## Architecture After Migration
```
Firebase Hosting          ←→  Firebase Authentication
     ↑                           ↑
Next.js App               ←→  Supabase Database (PostgreSQL)
                              ↓
                          Row Level Security (RLS)
                              ↓
                          Existing Tables & Relationships
```

## Migration Phases

### Phase 1: Preparation
1. [ ] Create Firebase project in console
2. [ ] Enable Google/GitHub authentication providers
3. [ ] Install Firebase SDK: `npm install firebase`
4. [ ] Backup current Supabase database
5. [ ] Add Firebase environment variables to `.env.local`

### Phase 2: Firebase Auth Integration
1. [ ] Configure Firebase as third-party auth provider in Supabase dashboard
2. [ ] Create Firebase initialization utility (`lib/firebase.ts`)
3. [ ] Update AuthProvider to use Firebase auth state
4. [ ] Implement Firebase token exchange for Supabase client
5. [ ] Update all auth pages (signin, signup, etc.) to use Firebase auth
6. [ ] Preserve referral system functionality

### Phase 3: User ID Mapping Strategy
Since we cannot modify existing foreign key relationships:
1. [ ] Create user_mapping table or extend user_metadata
2. [ ] When Firebase user signs in, check for existing Supabase auth user
3. [ ] If not exists, create one using Supabase admin API with Firebase UID
4. [ ] Modify RLS policies to check mapping instead of direct auth.uid()

### Phase 4: Firebase Hosting Setup
1. [ ] Initialize Firebase project: `firebase init`
2. [ ] Choose Hosting (not App Hosting for Next.js 14 compatibility)
3. [ ] Configure `firebase.json` with proper rewrites
4. [ ] Add `export const dynamic = 'force-dynamic'` to layout.tsx
5. [ ] Set up environment variables in Firebase project settings
6. [ ] Test build and deploy locally: `firebase serve`

### Phase 5: Database Adjustments
1. [ ] Create user_id_mapping table (firebase_uid → supabase_user_id)
2. [ ] Update RLS policies to use mapping table
3. [ ] Ensure trigger functions handle new user creation properly
4. [ ] Test all database operations with mapped user IDs

### Phase 6: Testing & Rollback
1. [ ] Test all auth flows (email/password, Google, GitHub)
2. [ ] Verify database operations work with mapped user IDs
3. [ ] Test referral system end-to-end
4. [ ] Test protected routes and data fetching
5. [ ] Keep Vercel deployment as fallback during transition

## Detailed Implementation Steps

### Step 1: Firebase Setup
```bash
# Install Firebase
npm install firebase

# Initialize Firebase project
firebase init
# Select Hosting, configure as single-page app
```

### Step 2: Environment Variables
Add to `.env.local`:
```
NEXT_PUBLIC_FIREBASE_API_KEY=your_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_domain
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_bucket
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
```

### Step 3: Firebase Initialization (lib/firebase.ts)
```typescript
import { initializeApp, type FirebaseApp } from 'firebase/app';
import { getAuth, type Auth, GoogleAuthProvider, GithubAuthProvider, 
         signInWithPopup, signInWithEmailAndPassword, 
         createUserWithEmailAndPassword, signOut, onAuthStateChanged, type User } from 'firebase/auth';

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

let app: FirebaseApp;
let auth: Auth;

if (typeof window !== 'undefined') {
  app = initializeApp(firebaseConfig);
  auth = getAuth(app);
}

// Export auth functions
export const signInWithGoogle = async () => {
  if (!auth) throw new Error('Firebase Auth not initialized');
  return await signInWithPopup(auth, new GoogleAuthProvider());
};

// ... other auth functions
```

### Step 4: Updated Auth Provider
Replace `components/auth-provider.tsx` with Firebase-based implementation that:
1. Uses Firebase auth state listeners
2. Maps Firebase users to Supabase users
3. Maintains same context interface for existing components

### Step 5: Supabase Client with Firebase Auth Token
Modify `lib/supabase/client.ts` to accept Firebase ID token:
```typescript
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { getAuth } from 'firebase/auth';

export const createClientWithFirebase = async () => {
  const supabase = createClientComponentClient();
  
  // Get Firebase ID token and set it for Supabase
  const firebaseAuth = getAuth();
  const idToken = await firebaseAuth.currentUser?.getIdToken();
  
  if (idToken) {
    // This would require a custom endpoint or using Supabase's 
    // third-party auth capabilities
  }
  
  return supabase;
};
```

### Step 6: Firebase Hosting Configuration (firebase.json)
```json
{
  "hosting": {
    "public": "public",
    "ignore": [
      "firebase.json",
      "**/.*",
      "**/node_modules/**"
    ],
    "rewrites": [
      {
        "source": "**",
        "destination": "/index.html"
      }
    ],
    "headers": [
      {
        "source": "**",
        "headers": [
          {
            "key": "Cache-Control",
            "value": "max-age=0, must-revalidate"
          }
        ]
      }
    ]
  }
}
```

### Step 7: Next.js Configuration Adjustments
Add to `app/layout.tsx`:
```typescript
export const dynamic = 'force-dynamic';
```

Update `next.config.js` for Firebase compatibility:
```javascript
/** @type {import('next').NextConfig} */
const nextConfig = {
  // Firebase Hosting compatibility
  output: 'standalone',
  // Other existing configs...
};

module.exports = nextConfig;
```

## Database Schema Changes Required

### 1. Create User Mapping Table
```sql
CREATE TABLE IF NOT EXISTS public.firebase_user_mapping (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  firebase_uid VARCHAR NOT NULL UNIQUE,
  supabase_user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  email VARCHAR,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.firebase_user_mapping ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Users can view own mapping" ON public.firebase_user_mapping
  FOR SELECT USING (auth.uid() = supabase_user_id);

CREATE POLICY "Users can insert own mapping" ON public.firebase_user_mapping
  FOR INSERT WITH CHECK (auth.uid() = supabase_user_id);
```

### 2. Update Existing RLS Policies
Modify existing policies to check the mapping table instead of direct `auth.uid()`:
```sql
-- Example for documents table
DROP POLICY IF EXISTS "Users can view own documents" ON documents;
CREATE POLICY "Users can view own documents" ON documents
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM firebase_user_mapping 
      WHERE firebase_user_mapping.firebase_uid = auth.uid()::text
      AND firebase_user_mapping.supabase_user_id = documents.user_id
    )
  );
```

## Risk Mitigation & Rollback Plan

### Risks:
1. **Authentication downtime** during transition
2. **User data loss** if mapping fails
3. **Referral system disruption**
4. **Performance issues** from additional lookup layer

### Mitigation Strategies:
1. **Gradual rollout**: Use Firebase custom auth tokens to migrate users slowly
2. **Backup verification**: Test database backups before migration
3. **Feature flags**: Implement auth provider switching via environment variable
4. **Monitoring**: Add logging for auth failures during transition

### Rollback Procedure:
1. Revert AuthProvider to Supabase implementation
2. Disable Firebase hosting
3. Re-enable Vercel deployment
4. Verify all auth flows work with Supabase
5. No database changes required for rollback (mapping table is additive)

## Estimated Timeline
- **Phase 1 (Prep)**: 4 hours
- **Phase 2 (Firebase Auth)**: 1-2 days
- **Phase 3 (User Mapping)**: 4-6 hours
- **Phase 4 (Firebase Hosting)**: 4 hours
- **Phase 5 (Testing)**: 1-2 days
- **Total**: 3-4 business days

## Success Criteria
1. [ ] All existing login methods work (email/password, Google, GitHub)
2. [ ] New user registration creates proper Supabase user records
3. [ ] Referral system functions correctly with Firebase auth users
4. [ ] All protected routes and data fetching work as expected
5. [ ] Performance is equal to or better than current Vercel setup
6. [ ] No regression in existing functionality

## Post-Migration Considerations
1. Monitor auth error rates for first 48 hours
2. Verify all email notifications (welcome, password reset) still work
3. Check that Stripe payments and webhooks function correctly
4. Validate that real-time subscriptions continue to work
5. Consider eventual migration to Firebase Database if Supabase costs become problematic