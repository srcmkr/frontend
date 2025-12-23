'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { getSystemStatus } from '@/lib/api-client';
import { Loader2 } from 'lucide-react';

interface SetupGuardProps {
  children: React.ReactNode;
}

/**
 * Client-side guard that checks system initialization status
 * and gates between Login and Setup flows
 */
export function SetupGuard({ children }: SetupGuardProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [isChecking, setIsChecking] = useState(true);
  const [systemStatus, setSystemStatus] = useState<{
    isInitialized: boolean;
    needsSetup: boolean;
  } | null>(null);

  useEffect(() => {
    const checkSetupStatus = async () => {
      try {
        const status = await getSystemStatus();
        setSystemStatus(status);

        // Gate logic: Redirect based on system status and current path
        const isOnSetupPage = pathname?.startsWith('/setup');

        if (status.needsSetup) {
          // System needs setup → force to /setup
          if (!isOnSetupPage) {
            router.replace('/setup');
          }
        } else {
          // System initialized → block /setup access
          if (isOnSetupPage) {
            router.replace('/');
          }
        }
      } catch (error) {
        console.error('Failed to check setup status:', error);
        // On error, allow through (will fail at API level if needed)
      } finally {
        setIsChecking(false);
      }
    };

    checkSetupStatus();
  }, [pathname, router]);

  // Show loading spinner during initial check
  if (isChecking) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center space-y-4">
          <Loader2 className="w-8 h-8 animate-spin text-primary mx-auto" />
          <p className="text-sm text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
