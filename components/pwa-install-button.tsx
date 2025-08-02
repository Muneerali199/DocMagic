'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Download, Check, Smartphone } from 'lucide-react';
import { usePWAInstall } from '@/hooks/use-pwa-install';
import { cn } from '@/lib/utils';

interface PWAInstallButtonProps {
  className?: string;
  variant?: 'default' | 'outline' | 'ghost' | 'link' | 'destructive' | 'secondary';
  size?: 'default' | 'sm' | 'lg' | 'icon';
  showText?: boolean;
}

export function PWAInstallButton({ 
  className, 
  variant = 'default', 
  size = 'default',
  showText = true 
}: PWAInstallButtonProps) {
  const { isInstallable, isInstalled, installApp } = usePWAInstall();
  const [isInstalling, setIsInstalling] = useState(false);

  const handleInstall = async () => {
    if (!isInstallable) return;
    
    setIsInstalling(true);
    try {
      await installApp();
    } finally {
      setIsInstalling(false);
    }
  };

  if (isInstalled) {
    return (
      <Button
        variant={variant}
        size={size}
        className={cn('cursor-default', className)}
        disabled
      >
        <Check className="h-4 w-4" />
        {showText && <span className="ml-2">App Installed</span>}
      </Button>
    );
  }

  if (!isInstallable) {
    return null;
  }

  return (
    <Button
      variant={variant}
      size={size}
      className={className}
      onClick={handleInstall}
      disabled={isInstalling}
    >
      {isInstalling ? (
        <div className="h-4 w-4 animate-spin rounded-full border-2 border-transparent border-t-current" />
      ) : (
        <Download className="h-4 w-4" />
      )}
      {showText && (
        <span className="ml-2">
          {isInstalling ? 'Installing...' : 'Install App'}
        </span>
      )}
    </Button>
  );
}
