# 🚀 DocMagic - Production Deployment Guide

## Quick Start

### Option 1: Automated Deployment (Windows)
```powershell
.\deploy.ps1
```

### Option 2: Manual Deployment
```bash
# 1. Install dependencies
npm install

# 2. Build for production
npm run build

# 3. Test locally
npm run start

# 4. Deploy
vercel --prod
```

---

## 📋 Pre-Deployment Checklist

### ✅ Environment Variables

Create `.env.local` with these variables:

```env
# Supabase (Required)
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here

# Google Gemini AI (Required)
GOOGLE_API_KEY=your_gemini_api_key_here
GEMINI_API_KEY=your_gemini_api_key_here

# Mistral AI (Optional - for fallback)
MISTRAL_API_KEY=your_mistral_api_key_here

# App Configuration
NEXT_PUBLIC_APP_URL=https://yourdomain.com
NODE_ENV=production
```

### ✅ Get API Keys

1. **Supabase:**
   - Go to https://supabase.com
   - Create a new project
   - Get URL and anon key from Settings > API

2. **Google Gemini:**
   - Go to https://makersuite.google.com/app/apikey
   - Create API key
   - Copy the key

3. **Mistral (Optional):**
   - Go to https://console.mistral.ai
   - Create API key

---

## 🌐 Deployment Platforms

### Option 1: Vercel (Recommended)

**Why Vercel?**
- ✅ Built for Next.js
- ✅ Automatic deployments from GitHub
- ✅ Free SSL certificates
- ✅ Global CDN
- ✅ Serverless functions

**Deploy Steps:**

1. **Install Vercel CLI:**
```bash
npm install -g vercel
```

2. **Login:**
```bash
vercel login
```

3. **Deploy:**
```bash
vercel --prod
```

4. **Set Environment Variables:**
   - Go to Vercel Dashboard
   - Select your project
   - Settings > Environment Variables
   - Add all variables from `.env.local`

5. **Custom Domain (Optional):**
   - Settings > Domains
   - Add your custom domain
   - Update DNS records

---

### Option 2: Netlify

**Deploy Steps:**

1. **Install Netlify CLI:**
```bash
npm install -g netlify-cli
```

2. **Login:**
```bash
netlify login
```

3. **Deploy:**
```bash
netlify deploy --prod
```

4. **Set Environment Variables:**
   - Go to Netlify Dashboard
   - Site settings > Environment variables
   - Add all variables

---

### Option 3: Railway

**Deploy Steps:**

1. **Install Railway CLI:**
```bash
npm install -g @railway/cli
```

2. **Login:**
```bash
railway login
```

3. **Deploy:**
```bash
railway up
```

4. **Set Environment Variables:**
   - Railway Dashboard
   - Variables tab
   - Add all variables

---

## 🔧 Build Configuration

### Next.js Config

File: `next.config.js`

```javascript
/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  images: {
    domains: ['images.pexels.com', 'images.unsplash.com'],
  },
  env: {
    NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL,
  },
}

module.exports = nextConfig
```

### Package.json Scripts

```json
{
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "next lint"
  }
}
```

---

## 📊 Post-Deployment Testing

### 1. Functionality Tests

Test these features:

- [ ] Homepage loads
- [ ] User registration/login
- [ ] Resume generation
- [ ] PDF export
- [ ] Diagram generation
- [ ] Website generation
- [ ] Template gallery
- [ ] Profile page

### 2. Performance Tests

Run Lighthouse audit:
```bash
npx lighthouse https://yourdomain.com --view
```

Target scores:
- Performance: > 90
- Accessibility: > 90
- Best Practices: > 90
- SEO: > 90

### 3. Security Tests

- [ ] HTTPS enabled
- [ ] Environment variables secured
- [ ] API routes protected
- [ ] CORS configured
- [ ] Rate limiting active

---

## 🔍 Monitoring & Analytics

### Recommended Tools:

1. **Vercel Analytics** (Built-in)
   - Real-time performance monitoring
   - Web Vitals tracking

2. **Google Analytics**
```html
<!-- Add to app/layout.tsx -->
<Script src="https://www.googletagmanager.com/gtag/js?id=GA_ID" />
```

3. **Sentry** (Error Tracking)
```bash
npm install @sentry/nextjs
npx @sentry/wizard -i nextjs
```

4. **LogRocket** (Session Replay)
```bash
npm install logrocket
```

---

## 🐛 Troubleshooting

### Build Errors

**Error: "Module not found"**
```bash
# Clear cache and reinstall
rm -rf node_modules .next
npm install
npm run build
```

**Error: "Environment variable not found"**
- Check `.env.local` exists
- Verify all required variables are set
- Restart dev server

### Deployment Errors

**Error: "Build failed on Vercel"**
- Check build logs in Vercel dashboard
- Verify environment variables are set
- Check Node.js version compatibility

**Error: "API routes not working"**
- Verify serverless function limits
- Check API route paths
- Review CORS configuration

---

## 📈 Performance Optimization

### 1. Image Optimization

Use Next.js Image component:
```tsx
import Image from 'next/image'

<Image 
  src="/image.jpg" 
  alt="Description"
  width={800}
  height={600}
  priority
/>
```

### 2. Code Splitting

Dynamic imports for large components:
```tsx
import dynamic from 'next/dynamic'

const HeavyComponent = dynamic(() => import('./HeavyComponent'), {
  loading: () => <p>Loading...</p>
})
```

### 3. Caching

Configure headers in `next.config.js`:
```javascript
async headers() {
  return [
    {
      source: '/static/:path*',
      headers: [
        {
          key: 'Cache-Control',
          value: 'public, max-age=31536000, immutable',
        },
      ],
    },
  ]
}
```

---

## 🔐 Security Best Practices

### 1. Environment Variables
- ✅ Never commit `.env.local` to Git
- ✅ Use different keys for dev/prod
- ✅ Rotate keys regularly

### 2. API Security
- ✅ Implement rate limiting
- ✅ Validate all inputs
- ✅ Use CORS properly
- ✅ Sanitize user data

### 3. Authentication
- ✅ Use Supabase Auth
- ✅ Implement JWT tokens
- ✅ Secure session storage
- ✅ Add CSRF protection

---

## 📱 Admin Panel Deployment

The admin panel is separate and should be deployed independently:

```bash
cd DocMagic-Admin
npm install
npm run build
vercel --prod
```

**Environment Variables for Admin:**
```env
VITE_API_URL=https://your-main-app.vercel.app
```

---

## 🔄 CI/CD Setup

### GitHub Actions

Create `.github/workflows/deploy.yml`:

```yaml
name: Deploy to Production

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - uses: actions/setup-node@v2
        with:
          node-version: '18'
      - run: npm install
      - run: npm run build
      - uses: amondnet/vercel-action@v20
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.ORG_ID }}
          vercel-project-id: ${{ secrets.PROJECT_ID }}
```

---

## 📞 Support & Maintenance

### Regular Tasks:
- Monitor error logs weekly
- Update dependencies monthly
- Review user feedback
- Performance optimization
- Security patches

### Backup Strategy:
- Database: Supabase automatic backups
- Code: GitHub repository
- Environment: Document all variables

---

## 🎉 Success!

Your DocMagic application is now deployed to production!

**Next Steps:**
1. ✅ Test all features
2. ✅ Monitor performance
3. ✅ Set up analytics
4. ✅ Configure custom domain
5. ✅ Share with users!

---

## 📚 Additional Resources

- [Next.js Deployment](https://nextjs.org/docs/deployment)
- [Vercel Documentation](https://vercel.com/docs)
- [Supabase Guides](https://supabase.com/docs)
- [Google Gemini API](https://ai.google.dev/docs)

---

**Need Help?**
- GitHub Issues: https://github.com/yourusername/DocMagic/issues
- Email: support@docmagic.com
- Discord: https://discord.gg/docmagic
