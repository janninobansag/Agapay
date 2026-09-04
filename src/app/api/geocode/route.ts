import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { isWithinPhilippines } from "@/lib/map/geography";

type CachedPlace = { label: string; latitude: number; longitude: number };
const cache = new Map<string, { expiresAt: number; places: CachedPlace[] }>();
let nextAllowedAt = 0;

async function waitForRateLimit() {
  const scheduledAt = Math.max(Date.now(), nextAllowedAt);
  nextAllowedAt = scheduledAt + 1_000;
  const wait = scheduledAt - Date.now();
  if (wait > 0) await new Promise((resolve) => setTimeout(resolve, wait));
}

export async function GET(request: Request) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  const query = new URL(request.url).searchParams.get("q")?.trim();
  if (!query || query.length < 3 || query.length > 160) {
    return NextResponse.json({ message: "Enter between 3 and 160 characters." }, { status: 400 });
  }

  const key = query.toLocaleLowerCase("en-PH");
  const cached = cache.get(key);
  if (cached && cached.expiresAt > Date.now()) return NextResponse.json({ places: cached.places });

  await waitForRateLimit();
  const baseUrl = process.env.NOMINATIM_BASE_URL ?? "https://nominatim.openstreetmap.org";
  const endpoint = new URL("/search", baseUrl);
  endpoint.searchParams.set("format", "jsonv2");
  endpoint.searchParams.set("q", query);
  endpoint.searchParams.set("countrycodes", "ph");
  endpoint.searchParams.set("limit", "5");
  const response = await fetch(endpoint, {
    headers: {
      Accept: "application/json",
      "User-Agent": `Agapay/0.1 (${process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000"})`,
    },
    next: { revalidate: 86_400 },
  });
  if (!response.ok) return NextResponse.json({ message: "Location search is temporarily unavailable." }, { status: 502 });

  const value: unknown = await response.json();
  const raw = Array.isArray(value) ? value as Array<{ display_name?: unknown; lat?: unknown; lon?: unknown }> : [];
  const places = raw.flatMap((place) => {
    const latitude = Number(place.lat);
    const longitude = Number(place.lon);
    return typeof place.display_name === "string" && isWithinPhilippines(latitude, longitude)
      ? [{ label: place.display_name.slice(0, 240), latitude, longitude }]
      : [];
  });
  if (cache.size >= 500) cache.delete(cache.keys().next().value ?? "");
  cache.set(key, { expiresAt: Date.now() + 86_400_000, places });
  return NextResponse.json({ places }, { headers: { "Cache-Control": "private, max-age=86400" } });
}
