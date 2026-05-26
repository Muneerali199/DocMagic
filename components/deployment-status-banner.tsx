'use client';

import { useEffect, useState } from 'react';

interface DeploymentStatus {
  isHealthy: boolean;
  message: string;
  lastChecked: Date;
  maintenanceMode?: boolean;
}

/**
 * Component to monitor deployment health and display status messages
 */
export function DeploymentStatusBanner() {
  const [status, setStatus] = useState<DeploymentStatus | null>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Check deployment status on component mount
    const checkStatus = async () => {
      try {
        const response = await fetch('/api/health');
        const data = await response.json();

        setStatus({
          isHealthy: response.ok,
          message: data.message || 'Service healthy',
          lastChecked: new Date(),
          maintenanceMode: data.maintenanceMode,
        });

        if (!response.ok) {
          setIsVisible(true);
        }
      } catch (error) {
        // If health check fails, deployment might be down
        setStatus({
          isHealthy: false,
          message: 'Unable to reach deployment. We are investigating.',
          lastChecked: new Date(),
        });
        setIsVisible(true);
      }
    };

    checkStatus();

    // Recheck every 30 seconds
    const interval = setInterval(checkStatus, 30000);

    return () => clearInterval(interval);
  }, []);

  if (!isVisible || !status || status.isHealthy) {
    return null;
  }

  return (
    <div className="fixed top-0 left-0 right-0 z-50 bg-red-50 border-b border-red-200 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
        <div className="flex items-center gap-4 flex-1">
          <div className="text-2xl">⚠️</div>
          <div>
            <h3 className="font-semibold text-red-900">
              {status.maintenanceMode ? 'Scheduled Maintenance' : 'Service Disruption'}
            </h3>
            <p className="text-sm text-red-700">{status.message}</p>
          </div>
        </div>
        <button
          onClick={() => setIsVisible(false)}
          className="text-red-500 hover:text-red-700 text-xl font-bold px-2"
        >
          ✕
        </button>
      </div>
    </div>
  );
}

/**
 * Hook to check if current deployment is healthy
 */
export function useDeploymentHealth() {
  const [isHealthy, setIsHealthy] = useState(true);

  useEffect(() => {
    const check = async () => {
      try {
        const response = await fetch('/api/health', { cache: 'no-store' });
        setIsHealthy(response.ok);
      } catch (error) {
        setIsHealthy(false);
      }
    };

    check();
    const interval = setInterval(check, 60000); // Check every minute

    return () => clearInterval(interval);
  }, []);

  return isHealthy;
}
