import { NextResponse } from "next/server";
import { getPrisma, isDatabaseConfigured } from "@/lib/db/prisma";

export const dynamic = "force-dynamic";

export async function GET() {
  if (!isDatabaseConfigured()) {
    return NextResponse.json({ status: "unavailable", database: "unconfigured" }, { status: 503 });
  }

  try {
    await getPrisma().$queryRaw`SELECT 1`;
    return NextResponse.json({ status: "ok" }, { headers: { "Cache-Control": "no-store" } });
  } catch {
    return NextResponse.json({ status: "unavailable", database: "unreachable" }, { status: 503, headers: { "Cache-Control": "no-store" } });
  }
}
