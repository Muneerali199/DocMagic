/** @type {import('next').NextConfig} */
const nextConfig = {
    // Disable React Strict Mode to prevent double-rendering in development
    reactStrictMode: false,
    
    // Image optimization
    images: {
        unoptimized: true,
        domains: ['bxiieunzrcdbxqadapcl.supabase.co'],
    },
    
    // URL handling
    trailingSlash: false,
    
    // Environment variables
    env: {
        NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL || 'https://docmagic1.netlify.app',
        NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://bxiieunzrcdbxqadapcl.supabase.co',
        NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJ4aWlldW56cmNkYnhxYWRhcGNsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDg4OTAzMTIsImV4cCI6MjA2NDQ2NjMxMn0.87x8KfKhfQoJlmbBg1I1zHwEMIE-Uvk-THCFmEn-n6E',
        GEMINI_API_KEY: process.env.GEMINI_API_KEY || 'AIzaSyAnota1ZAmXv3LoAfmI0J5VQarPv4qMTMA'
    },
    
    // Build configurations
    eslint: {
        ignoreDuringBuilds: true,
    },
    typescript: {
        ignoreBuildErrors: true,
    },
    
    // Webpack configuration
    webpack: (config, { isServer }) => {
        // Add file-loader for PDF files
        config.module.rules.push({
            test: /\.pdf$/,
            use: [
                {
                    loader: 'file-loader',
                    options: {
                        publicPath: '/_next/static/files',
                        outputPath: 'static/files',
                        name: '[name].[ext]',
                    },
                },
            ],
        });
        
        return config;
    },
};

module.exports = nextConfig;