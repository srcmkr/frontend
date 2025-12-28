"use client";

import { useParams } from "next/navigation";
import { useEffect } from "react";
import { useStatusPageBySlug } from "@/features/status-pages/api/queries";
import { ProtectedStatusPage } from "@/components/public-status/protected-status-page";
import { PublicStatusSkeleton } from "@/components/public-status/public-status-skeleton";
import StatusPageNotFound from "./not-found";

export default function StatusPage() {
  const params = useParams();
  const slug = params.slug as string;

  const { data: statusPage, isLoading, error } = useStatusPageBySlug(slug);

  // Update page title client-side for better UX
  useEffect(() => {
    if (statusPage) {
      document.title = statusPage.title || "Status Page";
    }
  }, [statusPage]);

  // Handle 401 - redirect to login
  useEffect(() => {
    if (error && 'status' in error && error.status === 401) {
      // Redirect to login with return URL
      const returnUrl = encodeURIComponent(window.location.pathname);
      window.location.href = `/login?returnUrl=${returnUrl}`;
    }
  }, [error]);

  // Handle loading state
  if (isLoading) {
    return <PublicStatusSkeleton groupCount={3} />;
  }

  // Handle 403 (IP blocked)
  if (error && 'status' in error && error.status === 403) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center space-y-4">
          <h1 className="text-2xl font-bold">Zugriff verweigert</h1>
          <p className="text-muted-foreground">
            Deine IP-Adresse ist nicht berechtigt, diese Status-Seite anzuzeigen.
          </p>
        </div>
      </div>
    );
  }

  // Handle 404 and other errors
  if (error || !statusPage) {
    return <StatusPageNotFound />;
  }

  // Prepare metadata for password protection check
  const metadata = {
    slug: statusPage.slug,
    passwordProtection: statusPage.passwordProtection,
    title: statusPage.title,
    description: statusPage.description,
    logo: statusPage.logoUrl,
    primaryColor: statusPage.primaryColor,
    theme: statusPage.theme,
    customCss: statusPage.customCss,
  };

  // If page is password-protected, don't send data (client will fetch after auth)
  const initialData = statusPage.passwordProtection
    ? null
    : {
        statusPage: {
          id: statusPage.id,
          title: statusPage.title,
          slug: statusPage.slug,
          description: statusPage.description,
          isPublic: statusPage.isPublic,
          hasPassword: statusPage.passwordProtection,
          logoUrl: statusPage.logoUrl,
          primaryColor: statusPage.primaryColor,
          theme: statusPage.theme,
          passwordProtection: statusPage.passwordProtection,
          ipWhitelistEnabled: statusPage.ipWhitelistEnabled,
          // Display Configuration
          showUptimeHistory: statusPage.showUptimeHistory,
          uptimeHistoryDays: statusPage.uptimeHistoryDays,
          showIncidents: statusPage.showIncidents,
          incidentHistoryDays: statusPage.incidentHistoryDays,
          showMaintenanceCalendar: statusPage.showMaintenanceCalendar,
          showPoweredByBranding: statusPage.showPoweredByBranding,
          customCss: statusPage.customCss,
          ipWhitelist: statusPage.ipWhitelist,
          password: statusPage.password,
          monitors: statusPage.groups.flatMap((g) => g.monitors),
          groups: statusPage.groups,
          announcements: statusPage.announcements,
          scheduledMaintenances: statusPage.scheduledMaintenances,
          createdAt: statusPage.createdAt,
          updatedAt: statusPage.updatedAt,
        },
        monitors: statusPage.monitors || [],
        incidents: statusPage.recentIncidents || [],
      };

  const groupCount = statusPage.groups.length;

  return (
    <ProtectedStatusPage
      metadata={metadata}
      initialData={initialData}
      groupCount={groupCount}
    />
  );
}
