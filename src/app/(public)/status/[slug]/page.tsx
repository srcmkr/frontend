import { notFound } from "next/navigation";
import { ProtectedStatusPage } from "@/components/public-status/protected-status-page";
import type { Metadata } from "next";

interface StatusPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({
  params,
}: StatusPageProps): Promise<Metadata> {
  const { slug } = await params;
  // TODO: Fetch from API
  // const statusPage = await fetch(`/api/status-pages/slug/${slug}`).then(r => r.json());

  return {
    title: "Status Page", // TODO: Use real title
    description: undefined, // TODO: Use real description
  };
}

export default async function StatusPage({ params }: StatusPageProps) {
  const { slug } = await params;

  // TODO: Implement server-side API call to GET /api/status-pages/slug/:slug
  // Backend must handle password protection server-side!

  // Placeholder metadata until API is implemented
  const metadata = {
    slug,
    passwordProtection: false,
  };

  // TODO: Fetch real data from backend
  const initialData = null;
  const groupCount = 3;

  return (
    <ProtectedStatusPage
      metadata={metadata}
      initialData={initialData}
      groupCount={groupCount}
    />
  );
}
