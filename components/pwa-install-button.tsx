'use client';

import React, { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Download, Check, Smartphone } from 'lucide-react';
import { usePWAInstall } from '@/hooks/use-pwa-install';
import { cn } from '@/lib/utils';

export interface PWAInstallButtonProps {
  className?: string;
  variant?: 'default' | 'outline' | 'ghost' | 'link' | 'destructive' | 'secondary';
  size?: 'default' | 'sm' | 'lg' | 'icon';
  showText?: boolean;
}

export const PWAInstallButton = React.forwardRef<HTMLButtonElement, PWAInstallButtonProps>(
  ({ className, variant = 'default', size = 'default', showText = true }, ref) => {
    const { isInstallable, isInstalled, installApp } = usePWAInstall();
    const [isInstalling, setIsInstalling] = useState(false);
    const installingRef = useRef(false);

    const handleInstall = async () => {
      if (!isInstallable || installingRef.current) return;
      
      installingRef.current = true;
      setIsInstalling(true);
      try {
        await installApp();
      } finally {
        installingRef.current = false;
        setIsInstalling(false);
      }
    };

    if (isInstalled) {
      return (
        <Button
          ref={ref}
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
      // Visible ring and arial-label assigned for the installed button 
      <Button
<<<<<<< HEAD
        ref={ref}
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
);
PWAInstallButton.displayName = 'PWAInstallButton';
=======
  variant={variant}
  size={size}
  className={cn('cursor-default focus-visible:ring-2 focus-visible:ring-yellow-400 focus-visible:ring-offset-2', className)}
  aria-label="App already installed"
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
    // main install button with focus-visible styles and aria-label for accessibility
  <Button
  variant={variant}
  size={size}
  className={cn('focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-yellow-400 focus-visible:ring-offset-2', className)}
  onClick={handleInstall}
  disabled={isInstalling}
  aria-label={isInstalling ? "Installing app, please wait" : "Install DraftDeckAI as an app"}
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
>>>>>>> 5257199 (fix: improve header accessibility - focus rings and aria labels (#456))
