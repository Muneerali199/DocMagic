'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/auth-context';

export function MFASetup() {
  const [code, setCode] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { setupMFA, verifyMFA } = useAuth();
  const [qrCode, setQrCode] = useState('');
  const [secret, setSecret] = useState('');
  const [step, setStep] = useState<'setup' | 'verify'>('setup');

  // Auto-setup MFA when component mounts
  useEffect(() => {
    if (step === 'setup') {
      handleSetupMFA();
    }
  }, []);

  const handleSetupMFA = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await setupMFA();
      
      if (error) throw error;
      
      setQrCode(data?.qrCode || '');
      setSecret(data?.secret || '');
      setStep('verify');
      toast.success('Scan the QR code with your authenticator app');
    } catch (error: any) {
      toast.error(error.message || 'Failed to set up MFA');
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyMFA = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!code) return;
    
    setIsLoading(true);
    try {
      const { error } = await verifyMFA(code);
      
      if (error) throw error;
      
      toast.success('MFA set up successfully!');
      // Redirect to dashboard or refresh the page
      window.location.href = '/dashboard';
    } catch (error: any) {
      toast.error(error.message || 'Failed to verify MFA code');
    } finally {
      setIsLoading(false);
    }
  };

  if (step === 'setup') {
    return (
      <div className="space-y-4">
        <h3 className="text-lg font-medium">Setting Up MFA</h3>
        <p className="text-sm text-muted-foreground">
          Please wait while we set up Multi-Factor Authentication for your account...
        </p>
        <div className="flex justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-medium">Verify MFA Setup</h3>
      <p className="text-sm text-muted-foreground">
        Scan the QR code with your authenticator app and enter the code below:
      </p>
      
      {qrCode && (
        <div className="flex flex-col items-center space-y-4">
          <img 
            src={qrCode} 
            alt="MFA QR Code" 
            className="w-48 h-48 p-2 bg-white rounded"
          />
          
          <div className="text-center">
            <p className="text-sm font-medium mb-1">Or enter this code manually:</p>
            <div className="font-mono bg-muted p-2 rounded-md text-sm">
              {secret.match(/\w{4}/g)?.join(' ') || secret}
            </div>
          </div>
        </div>
      )}
      
      <form onSubmit={handleVerifyMFA} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="mfa-code">Verification Code</Label>
          <Input
            id="mfa-code"
            type="text"
            inputMode="numeric"
            pattern="[0-9]*"
            value={code}
            onChange={(e) => setCode(e.target.value.replace(/\D/g, ''))}
            placeholder="Enter 6-digit code"
            maxLength={6}
            className="text-center text-lg font-mono tracking-widest"
            autoComplete="one-time-code"
            autoFocus
            required
          />
        </div>
        
        <div className="flex flex-col space-y-2">
          <Button 
            type="submit" 
            className="w-full" 
            disabled={isLoading || code.length !== 6}
          >
            {isLoading ? 'Verifying...' : 'Verify and Enable MFA'}
          </Button>
          
          <Button 
            type="button"
            variant="outline"
            className="w-full"
            onClick={() => setStep('setup')}
            disabled={isLoading}
          >
            Back to Setup
          </Button>
        </div>
      </form>
    </div>
  );
}
