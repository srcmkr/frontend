"use client";

import { useState, useCallback, useEffect } from "react";
import { useSyncExternalStore } from "react";
import type { StatusPage, Monitor, ExtendedIncident, StatusPageTheme } from "@/types";
import type { PublicStatusPageMetadata } from "@/lib/public-status-api";
import { isAuthenticated, setAuthenticated } from "@/lib/public-status-utils";
import { PublicStatusPage } from "./public-status-page";
import { PublicStatusSkeleton } from "./public-status-skeleton";
import { PasswordProtectionDialog } from "./password-protection-dialog";

interface ProtectedStatusPageProps {
  /** Minimal metadata - always safe to show */
  metadata: PublicStatusPageMetadata;
  /**
   * Full data - only provided for non-protected pages
   * For protected pages, this is null and must be fetched after auth
   */
  initialData: {
    statusPage: StatusPage;
    monitors: Monitor[];
    incidents: ExtendedIncident[];
  } | null;
  /** Number of groups for skeleton (from server-side count) */
  groupCount?: number;
}

// Empty subscribe function for useSyncExternalStore
const emptySubscribe = () => () => {};

// Available themes (excluding "system")
const themeClasses: StatusPageTheme[] = ["basic", "dark", "forest", "slate", "kiwi"];

/**
 * Wrapper component that handles password protection securely.
 *
 * For non-protected pages: Renders data directly
 * For protected pages: Shows skeleton + password dialog until authenticated
 */
export function ProtectedStatusPage({
  metadata,
  initialData,
  groupCount = 3,
}: ProtectedStatusPageProps) {
  // Track authenticated data after successful password entry
  const [authenticatedData, setAuthenticatedData] = useState<{
    statusPage: StatusPage;
    monitors: Monitor[];
    incidents: ExtendedIncident[];
  } | null>(null);

  // Track loading state during password validation
  const [isValidating, setIsValidating] = useState(false);
  const [passwordError, setPasswordError] = useState<string | null>(null);

  // Check if already authenticated from session storage
  const getSnapshot = useCallback(() => {
    if (!metadata.passwordProtection) return true;
    return isAuthenticated(metadata.slug);
  }, [metadata.passwordProtection, metadata.slug]);

  const getServerSnapshot = useCallback(() => {
    // On server, assume not authenticated for protected pages
    return !metadata.passwordProtection;
  }, [metadata.passwordProtection]);

  const wasAlreadyAuthenticated = useSyncExternalStore(
    emptySubscribe,
    getSnapshot,
    getServerSnapshot
  );

  // If already authenticated from session, fetch the data on mount
  useEffect(() => {
    if (wasAlreadyAuthenticated && metadata.passwordProtection && !authenticatedData && !initialData) {
      // User was previously authenticated - need to fetch data
      // In production this would validate the session token server-side
      fetchDataWithStoredAuth();
    }
  }, [wasAlreadyAuthenticated, metadata.passwordProtection, authenticatedData, initialData]);

  // Apply theme to document (same logic as PublicStatusPage)
  useEffect(() => {
    const root = document.documentElement;
    const theme = metadata.theme;

    // Remove all theme classes first
    themeClasses.forEach((t) => root.classList.remove(t));

    // Apply the configured theme (if not "system" or undefined)
    if (theme && theme !== "system" && theme !== "kiwi") {
      root.classList.add(theme);
    }

    // Cleanup: restore original theme when component unmounts
    return () => {
      themeClasses.forEach((t) => root.classList.remove(t));
    };
  }, [metadata.theme]);

  // Fetch data using stored session auth
  const fetchDataWithStoredAuth = async () => {
    try {
      // In production: call API with session token
      // For mock: simulate API call
      const response = await fetch(`/api/status/${metadata.slug}/data`, {
        credentials: "include",
      });

      if (response.ok) {
        const data = await response.json();
        setAuthenticatedData(data);
      }
    } catch {
      // Session might be invalid, will show password dialog
    }
  };

  // Handle password submission
  const handlePasswordSubmit = async (password: string): Promise<boolean> => {
    setIsValidating(true);
    setPasswordError(null);

    try {
      // Call API to validate password and get data
      const response = await fetch(`/api/status/${metadata.slug}/auth`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
        credentials: "include",
      });

      if (response.ok) {
        const data = await response.json();
        setAuthenticatedData(data);
        setAuthenticated(metadata.slug);
        return true;
      } else {
        setPasswordError("Falsches Passwort. Bitte erneut versuchen.");
        return false;
      }
    } catch {
      setPasswordError("Verbindungsfehler. Bitte erneut versuchen.");
      return false;
    } finally {
      setIsValidating(false);
    }
  };

  // Apply custom styles
  const customStyle = metadata.primaryColor
    ? ({ "--status-primary": metadata.primaryColor } as React.CSSProperties)
    : undefined;

  // Case 1: Non-protected page with initial data
  if (!metadata.passwordProtection && initialData) {
    return (
      <PublicStatusPage
        statusPage={initialData.statusPage}
        monitors={initialData.monitors}
        incidents={initialData.incidents}
      />
    );
  }

  // Case 2: Protected page, already authenticated with data
  if (authenticatedData) {
    return (
      <PublicStatusPage
        statusPage={authenticatedData.statusPage}
        monitors={authenticatedData.monitors}
        incidents={authenticatedData.incidents}
      />
    );
  }

  // Case 3: Protected page, not yet authenticated
  // Show skeleton + password dialog
  return (
    <>
      {/* Custom CSS injection */}
      {metadata.customCss && (
        <style dangerouslySetInnerHTML={{ __html: metadata.customCss }} />
      )}

      {/* Password dialog */}
      <PasswordProtectionDialog
        slug={metadata.slug}
        onSubmit={handlePasswordSubmit}
        isLoading={isValidating}
        error={passwordError}
      />

      {/* Skeleton behind dialog - realistic but no real data */}
      <div className="blur-sm pointer-events-none" style={customStyle}>
        <PublicStatusSkeleton
          title={metadata.title}
          description={metadata.description}
          logo={metadata.logo}
          groupCount={groupCount}
        />
      </div>
    </>
  );
}
