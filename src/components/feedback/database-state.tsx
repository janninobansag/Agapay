import { Database, TriangleAlert } from "lucide-react";
import type { DataAvailability } from "@/server/queries/reports";

export function DatabaseState({ availability }: { availability: DataAvailability }) {
  if (availability === "ready") return null;

  const unconfigured = availability === "unconfigured";

  return (
    <div className="mb-6 flex gap-3 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-amber-950" role="status">
      {unconfigured ? <Database className="mt-0.5 shrink-0" size={20} /> : <TriangleAlert className="mt-0.5 shrink-0" size={20} />}
      <div>
        <p className="text-sm font-bold">{unconfigured ? "Database setup required" : "Database is unavailable"}</p>
        <p className="mt-1 text-sm leading-6 text-amber-900/80">
          {unconfigured
            ? "Set DATABASE_URL, apply the migration, and run the seed command."
            : "Check that PostgreSQL is running and that DATABASE_URL is correct."}
          {" "}Detailed instructions are in docs/development.md.
        </p>
      </div>
    </div>
  );
}

