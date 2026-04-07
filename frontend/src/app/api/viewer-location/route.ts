import { NextResponse } from "next/server";
import { getViewerGeo } from "@/lib/geo";

export async function GET() {
  const geo = await getViewerGeo();

  return NextResponse.json(
    {
      country_code: geo.countryCode,
      country_name: geo.countryName,
      is_nigeria: geo.isNigeria,
    },
    {
      headers: {
        "Cache-Control": "no-store, no-cache, must-revalidate",
      },
    }
  );
}