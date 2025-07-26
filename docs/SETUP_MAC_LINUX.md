# 🖥️ First-Time Setup for Mac/Linux

## Prerequisites
- Node.js 18+ (LTS recommended)
- npm 9+ or yarn 1.22+
- Git
- Supabase account (for authentication & database)
- Google Gemini API key (for AI features)

## Installation Steps

### 1. Clone the Repository
```bash
git clone https://github.com/Muneerali199/DocMagic.git
cd DocMagic
```

### 2. Install Dependencies
```bash
# Using npm
npm install

# Or using yarn
yarn install
```

### 3. Environment Setup
1. Copy the example environment file:
   ```bash
   cp .env.local.example .env.local
   ```
2. Open `.env.local` and update with your API keys:
   ```
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
   GOOGLE_GEMINI_API_KEY=your_gemini_api_key
   ```

### 4. Fix Permission Issues (Linux)
If you encounter permission errors:
```bash
# For npm global installations
sudo chown -R $USER:$USER ~/.npm
sudo chown -R $USER:$USER ~/.config

# For project dependencies
sudo chown -R $USER:$USER node_modules
```

### 5. Start Development Server
```bash
npm run dev
# or
yarn dev
```

## Common Issues & Solutions

### 1. Node.js Version Issues
If you have multiple Node.js versions installed, use nvm:
```bash
# Install nvm (if not already installed)
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash

# Install and use Node.js LTS
nvm install --lts
nvm use --lts
```

### 2. Port Already in Use
If port 3000 is in use:
```bash
# Find and kill the process
lsof -i :3000
kill -9 <PID>

# Or change the port in package.json
# Update "dev" script to use a different port
"dev": "next dev -p 3001"
```

### 3. Missing Dependencies
If you see "module not found" errors:
```bash
# Clear npm cache and reinstall
rm -rf node_modules
rm package-lock.json
npm cache clean --force
npm install
```

### 4. Database Connection Issues
If you can't connect to Supabase:
- Verify your `.env.local` variables
- Check if your IP is whitelisted in Supabase
- Ensure your Supabase project is running

## Need Help?
If you encounter any other issues, please:
1. Check the [GitHub Issues](https://github.com/Muneerali199/DocMagic/issues) for similar problems
2. Search our [Discussions](https://github.com/Muneerali199/DocMagic/discussions) for solutions
3. Open a new issue if you can't find an existing solution
