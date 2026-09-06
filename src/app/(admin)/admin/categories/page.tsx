import { CategoryManagement } from "@/features/admin/components/category-management";
import { requireRole } from "@/lib/auth/user";
import { getPrisma } from "@/lib/db/prisma";

export const metadata = { title: "Issue categories" };
export const dynamic = "force-dynamic";

export default async function AdminCategoriesPage() {
  await requireRole(["ADMIN"]);
  const categories = await getPrisma().issueCategory.findMany({ orderBy: { name: "asc" }, include: { _count: { select: { reports: true } } } });
  return <div><p className="text-sm font-bold uppercase tracking-[0.14em] text-brand">Administration</p><h1 className="mt-2 text-3xl font-bold tracking-[-0.04em] text-brand-dark">Issue categories</h1><p className="mt-2 max-w-2xl text-muted">Manage the issue types residents can select when submitting a report.</p><div className="mt-8"><CategoryManagement categories={categories.map((category) => ({ id: category.id, name: category.name, slug: category.slug, description: category.description, isActive: category.isActive, reportCount: category._count.reports }))} /></div></div>;
}
