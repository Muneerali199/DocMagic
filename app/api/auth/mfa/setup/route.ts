import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { rateLimit } from '@/lib/rate-limit';

const { NextResponse } = require('next/server');

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  const cookieStore = cookies();
  const supabase = createRouteHandlerClient({ cookies: () => cookieStore });
  
  try {
    // Get current user session
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session) {
      return NextResponse.json(
        { error: 'Not authenticated' },
        { status: 401 }
      );
    }
    
    // Generate a new TOTP secret
    const { data: enrollData, error } = await supabase.auth.mfa.enroll({
      factorType: 'totp',
      issuer: 'DocMagic',
    });
    
    if (error) {
      throw error;
    }
    
    // The secret is available in the totp.secret property
    return NextResponse.json({
      secret: enrollData.totp.secret,
      qrCode: enrollData.totp.qr_code,
    });
    
  } catch (error: any) {
    console.error('MFA setup error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to set up MFA' },
      { status: error.status || 500 }
    );
  }
}
