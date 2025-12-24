import { redirect } from 'next/navigation';
import { getSystemStatus } from '@/lib/api-client';

/**
 * Root page that routes users based on system initialization status
 *
 * This Server Component handles the primary routing logic:
 * - Fresh installation (needsSetup=true) → /setup
 * - Initialized system (needsSetup=false) → /dashboard
 *
 * The redirect happens server-side BEFORE any client-side rendering,
 * ensuring the URL properly updates and avoiding race conditions
 * with Next.js App Router route groups.
 *
 * Note: SetupGuard acts as a defensive layer for direct navigation.
 */
export default async function RootPage() {
  try {
    const status = await getSystemStatus();

    if (status.needsSetup) {
      // System needs initial setup - redirect to setup wizard
      redirect('/setup');
    } else {
      // System initialized - redirect to dashboard
      redirect('/dashboard');
    }
  } catch (error) {
    // If API is unreachable, default to setup page as safe fallback
    // The setup page will show an appropriate error if backend is down
    console.error('[RootPage] Failed to check system status:', error);
    redirect('/setup');
  }
}
