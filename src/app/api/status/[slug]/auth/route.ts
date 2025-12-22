import { NextRequest, NextResponse } from "next/server";
import {
  validateStatusPagePassword,
  getStatusPageData,
} from "@/lib/public-status-api";

interface RouteParams {
  params: Promise<{ slug: string }>;
}

/**
 * POST /api/status/[slug]/auth
 * Validate password and return status page data if correct
 */
export async function POST(request: NextRequest, { params }: RouteParams) {
  const { slug } = await params;

  try {
    const body = await request.json();
    const { password } = body;

    if (!password || typeof password !== "string") {
      return NextResponse.json(
        { error: "Password required" },
        { status: 400 }
      );
    }

    // Validate password
    const isValid = validateStatusPagePassword(slug, password);

    if (!isValid) {
      return NextResponse.json(
        { error: "Invalid password" },
        { status: 401 }
      );
    }

    // Password valid - return full data
    const data = getStatusPageData(slug);

    if (!data) {
      return NextResponse.json(
        { error: "Status page not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(data);
  } catch {
    return NextResponse.json(
      { error: "Invalid request" },
      { status: 400 }
    );
  }
}
