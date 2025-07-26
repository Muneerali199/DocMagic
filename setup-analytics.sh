#!/bin/bash

# DocMagic Analytics Dashboard Development Setup
# This script helps set up the development environment for testing the analytics dashboard

echo "🪄 DocMagic Analytics Dashboard Setup"
echo "====================================="

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    echo "❌ Error: package.json not found. Please run this script from the DocMagic root directory."
    exit 1
fi

echo "📦 Installing dependencies..."
npm install --no-optional

echo "🗄️ Database Migration Instructions:"
echo "1. Go to your Supabase project dashboard"
echo "2. Navigate to SQL Editor"
echo "3. Run the migration file: supabase/migrations/20250725000000_add_analytics_tables.sql"
echo ""

echo "🌐 Environment Variables Required:"
echo "Make sure you have these in your .env.local:"
echo "- NEXT_PUBLIC_SUPABASE_URL"
echo "- NEXT_PUBLIC_SUPABASE_ANON_KEY"
echo "- SUPABASE_SERVICE_ROLE_KEY"
echo ""

echo "🚀 Starting Development Server:"
echo "Run: npm run dev"
echo ""

echo "📊 Testing the Analytics Dashboard:"
echo "1. Start the development server"
echo "2. Sign in to your account"
echo "3. Navigate to /analytics"
echo "4. Create some test documents to generate analytics data"
echo "5. View presentations publicly to test anonymous tracking"
echo ""

echo "✨ Analytics Features Available:"
echo "- 📈 Usage statistics and trends"
echo "- 👁️ Document view tracking"
echo "- ⚡ Performance metrics"
echo "- 🎯 Smart insights and suggestions"
echo "- 📊 Interactive charts and visualizations"
echo "- 🔄 Real-time analytics tracking"
echo ""

echo "🔧 Troubleshooting:"
echo "- If you get TypeScript errors, run: npm run build"
echo "- For database issues, check your Supabase connection"
echo "- For missing dependencies, try: npm install --force"
echo ""

echo "✅ Setup complete! Ready to test the Analytics Dashboard."
echo "Navigate to http://localhost:3000/analytics after starting the dev server."
