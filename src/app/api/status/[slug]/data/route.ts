import { NextRequest, NextResponse } from "next/server";
import { getStatusPageData, getStatusPageMetadata } from "@/lib/public-status-api";
import { cookies } from "next/headers";

interface RouteParams {
  params: Promise<{ slug: string }>;
}

/**
 * GET /api/status/[slug]/data
 * Get status page data - requires prior authentication for protected pages
 */
export async function GET(_request: NextRequest, { params }: RouteParams) {
  const { slug } = await params;

  // Get metadata to check if protected
  const metadata = getStatusPageMetadata(slug);

  if (!metadata) {
    return NextResponse.json(
      { error: "Status page not found" },
      { status: 404 }
    );
  }

  // For password-protected pages, check for auth cookie/session
  if (metadata.passwordProtection) {
    const cookieStore = await cookies();
    const authCookie = cookieStore.get(`status-auth-${slug}`);

    // In a real implementation, this would validate a secure session token
    // For the mock, we just check if the cookie exists
    if (!authCookie || authCookie.value !== "authenticated") {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }
  }

  // Return full data
  const data = getStatusPageData(slug);

  if (!data) {
    return NextResponse.json(
      { error: "Status page not found" },
      { status: 404 }
    );
  }

  return NextResponse.json(data);
}
