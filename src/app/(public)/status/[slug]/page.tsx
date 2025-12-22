import { notFound } from "next/navigation";
import { getStatusPageBySlug } from "@/mocks/status-pages";
import { ProtectedStatusPage } from "@/components/public-status/protected-status-page";
import {
  getStatusPageMetadata,
  getStatusPageData,
} from "@/lib/public-status-api";
import type { Metadata } from "next";

interface StatusPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({
  params,
}: StatusPageProps): Promise<Metadata> {
  const { slug } = await params;
  const statusPage = getStatusPageBySlug(slug);

  if (!statusPage) {
    return {
      title: "Status Page Not Found",
    };
  }

  return {
    title: statusPage.title,
    description: statusPage.description,
  };
}

export default async function StatusPage({ params }: StatusPageProps) {
  const { slug } = await params;

  // Get metadata - safe for all pages
  const metadata = getStatusPageMetadata(slug);

  if (!metadata) {
    notFound();
  }

  // For non-protected pages, also get the full data server-side
  // For protected pages, data will be fetched client-side after auth
  let initialData = null;

  if (!metadata.passwordProtection) {
    initialData = getStatusPageData(slug);
  }

  // Count groups for skeleton (safe metadata)
  const statusPage = getStatusPageBySlug(slug);
  const groupCount = statusPage?.groups.length ?? 3;

  return (
    <ProtectedStatusPage
      metadata={metadata}
      initialData={initialData}
      groupCount={groupCount}
    />
  );
}
