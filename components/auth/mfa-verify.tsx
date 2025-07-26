'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { createClient } from '@/lib/supabase/client';

export function MFAVerify() {
  const [code, setCode] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const supabase = createClient();

  const verifyCode = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!code) return;
    
    setIsLoading(true);
    try {
      const { error } = await supabase.auth.mfa.verifyWithTotp({
        code,
      });

      if (error) throw error;
      toast.success('Verified successfully!');
      // The page will automatically update with the new session
    } catch (error) {
      toast.error('Invalid verification code');
      console.error('MFA verification error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-medium">Enter Verification Code</h3>
      <p className="text-sm text-muted-foreground">
        Please enter the code from your authenticator app
      </p>
      
      <form onSubmit={verifyCode} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="mfa-code">Verification Code</Label>
          <Input
            id="mfa-code"
            type="text"
            value={code}
            onChange={(e) => setCode(e.target.value)}
            placeholder="123456"
            autoComplete="one-time-code"
            inputMode="numeric"
            pattern="[0-9]*"
          />
        </div>
        
        <Button type="submit" className="w-full" disabled={isLoading}>
          {isLoading ? 'Verifying...' : 'Verify'}
        </Button>
      </form>
    </div>
  );
}
