// Security configuration and utilities

export const SECURITY_CONFIG = {
  // Rate limiting
  RATE_LIMITS: {
    AUTH: { requests: 10, windowMs: 15 * 60 * 1000 }, // 10 requests per 15 minutes
    GENERATE: { requests: 20, windowMs: 15 * 60 * 1000 }, // 20 requests per 15 minutes
    API: { requests: 100, windowMs: 15 * 60 * 1000 }, // 100 requests per 15 minutes
  },
  
  // Input validation limits
  INPUT_LIMITS: {
    NAME_MAX_LENGTH: 100,
    EMAIL_MAX_LENGTH: 254,
    PASSWORD_MIN_LENGTH: 8,
    PASSWORD_MAX_LENGTH: 128,
    PROMPT_MAX_LENGTH: 5000,
    CONTENT_MAX_LENGTH: 10000,
  },
  
  // Allowed file types for uploads
  ALLOWED_FILE_TYPES: [
    'image/jpeg',
    'image/png',
    'image/gif',
    'image/webp',
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  ],
  
  // Maximum file size (5MB)
  MAX_FILE_SIZE: 5 * 1024 * 1024,
  
  // Session configuration
  SESSION: {
    MAX_AGE: 24 * 60 * 60, // 24 hours
    REFRESH_THRESHOLD: 60 * 60, // 1 hour
  },
};

// Security headers for different environments
export const getSecurityHeaders = (isDevelopment: boolean = false) => {
  const baseHeaders = {
    'X-Frame-Options': 'DENY',
    'X-Content-Type-Options': 'nosniff',
    'X-XSS-Protection': '1; mode=block',
    'Referrer-Policy': 'strict-origin-when-cross-origin',
  };

  if (!isDevelopment) {
    return {
      ...baseHeaders,
      'Strict-Transport-Security': 'max-age=31536000; includeSubDomains; preload',
      'Content-Security-Policy': [
        "default-src 'self'",
        "script-src 'self' 'unsafe-eval' 'unsafe-inline' https://js.stripe.com",
        "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
        "font-src 'self' https://fonts.gstatic.com",
        "img-src 'self' data: https: blob:",
        "connect-src 'self' https://*.supabase.co https://api.stripe.com https://generativelanguage.googleapis.com",
        "frame-src https://js.stripe.com",
        "object-src 'none'",
        "base-uri 'self'",
        "form-action 'self'",
        "frame-ancestors 'none'",
      ].join('; '),
    };
  }

  return baseHeaders;
};

// Validate environment variables
export function validateEnvironmentVariables() {
  const required = [
    'NEXT_PUBLIC_SUPABASE_URL',
    'NEXT_PUBLIC_SUPABASE_ANON_KEY',
    'GEMINI_API_KEY',
  ];

  const missing = required.filter(key => !process.env[key]);
  
  if (missing.length > 0) {
    throw new Error(`Missing required environment variables: ${missing.join(', ')}`);
  }

  // Validate URL format
  try {
    new URL(process.env.NEXT_PUBLIC_SUPABASE_URL!);
  } catch {
    throw new Error('NEXT_PUBLIC_SUPABASE_URL must be a valid URL');
  }

  // Validate API key format (basic check)
  if (process.env.GEMINI_API_KEY!.length < 20) {
    throw new Error('GEMINI_API_KEY appears to be invalid');
  }
}

// Log security events
export function logSecurityEvent(event: string, details: any, ip?: string) {
  const timestamp = new Date().toISOString();
  const logEntry = {
    timestamp,
    event,
    ip: ip || 'unknown',
    details,
  };
  
  // In production, send to monitoring service
  if (process.env.NODE_ENV === 'production') {
    console.warn('SECURITY_EVENT:', JSON.stringify(logEntry));
  } else {
    console.log('Security Event:', logEntry);
  }
}

// Check if request is from allowed origin
export function isAllowedOrigin(origin: string | null, host: string): boolean {
  if (!origin) return false;
  
  const allowedOrigins = [
    `https://${host}`,
    'https://docmagic1.netlify.app',
    'https://your-vercel-url.vercel.app',
  ];
  
  if (process.env.NODE_ENV === 'development') {
    allowedOrigins.push(
      'http://localhost:3000',
      'http://127.0.0.1:3000',
      'http://localhost:3001',
      'http://127.0.0.1:3001',
      'http://localhost:3002',
      'http://127.0.0.1:3002',
      'http://localhost:3003',
      'http://127.0.0.1:3003'
    );
  }
  
  return allowedOrigins.includes(origin);
}