import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { rateLimit } from '@/lib/rate-limit';

const { NextResponse } = require('next/server');

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  const cookieStore = cookies();
  const supabase = createRouteHandlerClient({ cookies: () => cookieStore });
  
  try {
    const { code } = await request.json();
    
    if (!code) {
      return NextResponse.json(
        { error: 'Verification code is required' },
        { status: 400 }
      );
    }
    
    // Get the current session to check if MFA is required
    const { data: sessionData, error: sessionCheckError } = await supabase.auth.getSession();
    
    if (sessionCheckError || !sessionData.session) {
      throw new Error('No active session found');
    }
    
    // Get the current user's MFA factors
    const { data: factors, error: factorsError } = await supabase.auth.mfa.listFactors();
    
    if (factorsError) {
      throw factorsError;
    }
    
    // Find the TOTP factor
    const totpFactor = factors.totp[0];
    
    if (!totpFactor) {
      throw new Error('No TOTP factor found');
    }
    
    // Create a challenge for the factor
    const { data: challenge, error: challengeError } = await supabase.auth.mfa.challenge({
      factorId: totpFactor.id
    });
    
    if (challengeError) {
      throw challengeError;
    }
    
    // Verify the code with the challenge
    const { data: verifyData, error: verifyError } = await supabase.auth.mfa.challengeAndVerify({
      factorId: totpFactor.id,
      code,
    });
    
    if (verifyError) {
      throw verifyError;
    }
    
    // Get the updated session
    const { data: updatedSession, error: sessionUpdateError } = await supabase.auth.getSession();
    
    if (sessionUpdateError) {
      throw sessionUpdateError;
    }
    
    return NextResponse.json({
      message: 'MFA verification successful',
      session: updatedSession.session,
    });
    
  } catch (error: any) {
    console.error('MFA verification error:', error);
    return NextResponse.json(
      { error: error.message || 'MFA verification failed' },
      { status: error.status || 401 }
    );
  }
}
