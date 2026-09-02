import { getPrisma, isDatabaseConfigured } from "@/lib/db/prisma";
import type { QueryResult } from "@/server/queries/reports";

export type CategoryOption = {
  id: string;
  name: string;
};

export async function getActiveCategories(): Promise<QueryResult<CategoryOption[]>> {
  if (!isDatabaseConfigured()) return { data: [], availability: "unconfigured" };

  try {
    const categories = await getPrisma().issueCategory.findMany({
      where: { isActive: true },
      select: { id: true, name: true },
      orderBy: { name: "asc" },
    });

    return { data: categories, availability: "ready" };
  } catch (error) {
    console.error("Unable to load issue categories", error);
    return { data: [], availability: "unavailable" };
  }
}

