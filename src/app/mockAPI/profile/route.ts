/**
 * @file mockAPI/profile/route.ts
 * @summary Mock API service called by advanced/actions.ts.
 */

import { NextRequest, NextResponse } from "next/server";

const APIKEY = "test123";

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const apikey = searchParams.get("apikey");
  if (apikey !== APIKEY) {
    return new NextResponse("Unauthorized", { status: 403 });
  }

  return NextResponse.json({ alias: "spiderman272", tier: "gold" });
}
