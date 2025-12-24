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
 *
 * NOTE: Primary routing is handled by the root page (app/page.tsx) on the server.
 * This guard acts as a DEFENSIVE LAYER to handle:
 * - Direct navigation to protected routes
 * - Bookmarked URLs
 * - Client-side navigation that bypasses the root page
 * - API error states
 */
export function SetupGuard({ children }: SetupGuardProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [isChecking, setIsChecking] = useState(true);
  const [shouldRedirect, setShouldRedirect] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [systemStatus, setSystemStatus] = useState<{
    isInitialized: boolean;
    needsSetup: boolean;
  } | null>(null);

  const checkSetupStatus = async () => {
    console.log('[SetupGuard] Checking setup status, pathname:', pathname);
    setError(null);
    setIsChecking(true);

    try {
      const status = await getSystemStatus();
      console.log('[SetupGuard] System status:', status);
      setSystemStatus(status);

      // Gate logic: Redirect based on system status and current path
      const isOnSetupPage = pathname?.startsWith('/setup');
      console.log('[SetupGuard] isOnSetupPage:', isOnSetupPage);

      if (status.needsSetup) {
        // System needs setup → force to /setup
        if (!isOnSetupPage) {
          console.log('[SetupGuard] Redirecting to /setup');
          setShouldRedirect(true);
          router.replace('/setup');
        } else {
          console.log('[SetupGuard] Already on setup page, no redirect');
          setShouldRedirect(false);
        }
      } else {
        // System initialized → block /setup access
        if (isOnSetupPage) {
          console.log('[SetupGuard] Defensive redirect: setup page accessed when initialized');
          setShouldRedirect(true);
          router.replace('/dashboard');
        } else {
          console.log('[SetupGuard] System initialized, on correct page');
          setShouldRedirect(false);
        }
      }
    } catch (error) {
      console.error('[SetupGuard] Failed to check setup status:', error);
      setError('Unable to reach the API. Please check your connection.');
      setShouldRedirect(false);
    } finally {
      console.log('[SetupGuard] Setting isChecking=false');
      setIsChecking(false);
    }
  };

  useEffect(() => {
    checkSetupStatus();
  }, [pathname, router]);

  // Show error message if API is unreachable
  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center space-y-4 max-w-md px-4">
          <div className="w-12 h-12 rounded-full bg-destructive/10 flex items-center justify-center mx-auto">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="w-6 h-6 text-destructive"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
              />
            </svg>
          </div>
          <h2 className="text-lg font-semibold text-foreground">
            Connection Error
          </h2>
          <p className="text-sm text-muted-foreground">{error}</p>
          <button
            onClick={() => checkSetupStatus()}
            className="inline-flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium text-primary-foreground bg-primary rounded-md hover:bg-primary/90 transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  // Show loading spinner during initial check or redirect
  if (isChecking || shouldRedirect) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center space-y-4">
          <Loader2 className="w-8 h-8 animate-spin text-primary mx-auto" />
          <p className="text-sm text-muted-foreground">
            {shouldRedirect ? 'Redirecting...' : 'Loading...'}
          </p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
