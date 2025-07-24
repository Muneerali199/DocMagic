/** @type {import('next').NextConfig} */
const nextConfig = {

    images: { unoptimized: true },
    trailingSlash: false,

    // Environment configuration
    env: {
        // Single production URL (your primary domain)
        NEXT_PUBLIC_APP_URL: 'https://docmagic1.netlify.app',

        // Other environment-specific variables
        NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://bxiieunzrcdbxqadapcl.supabase.co',
        NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJ4aWlldW56cmNkYnhxYWRhcGNsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDg4OTAzMTIsImV4cCI6MjA2NDQ2NjMxMn0.87x8KfKhfQoJlmbBg1I1zHwEMIE-Uvk-THCFmEn-n6E',
        GEMINI_API_KEY: process.env.GEMINI_API_KEY || 'AIzaSyAnota1ZAmXv3LoAfmI0J5VQarPv4qMTMA'
    },

    // Build configurations
    eslint: { ignoreDuringBuilds: true },
    typescript: { ignoreBuildErrors: true }
};

module.exports = nextConfig;