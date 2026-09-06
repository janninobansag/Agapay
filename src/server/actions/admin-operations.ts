"use server";

import { UserRole, UserStatus } from "@prisma/client";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { requireRole } from "@/lib/auth/user";
import { getPrisma } from "@/lib/db/prisma";

export type AdminOperationState = { message?: string; success?: string; errors?: Record<string, string[]> };
const initialState: AdminOperationState = {};

const categorySchema = z.object({
  name: z.string().trim().min(2, "Enter a category name.").max(80),
  description: z.string().trim().max(240, "Keep the description under 240 characters.").optional(),
});
const teamSchema = z.object({
  name: z.string().trim().min(2, "Enter a team name.").max(120),
  contactEmail: z.union([z.literal(""), z.string().trim().toLowerCase().email("Enter a valid contact email.").max(320)]),
  memberIds: z.array(z.string()).max(50),
});

function refreshOperations() {
  revalidatePath("/admin");
  revalidatePath("/admin/categories");
  revalidatePath("/admin/teams");
  revalidatePath("/staff");
}

function makeSlug(name: string) {
  return name.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}

export async function createCategory(_previousState: AdminOperationState = initialState, formData: FormData): Promise<AdminOperationState> {
  void _previousState;
  const admin = await requireRole([UserRole.ADMIN]);
  const parsed = categorySchema.safeParse({ name: formData.get("name"), description: formData.get("description") || undefined });
  if (!parsed.success) return { errors: parsed.error.flatten().fieldErrors };
  const slug = makeSlug(parsed.data.name);
  if (!slug) return { message: "Use letters or numbers in the category name." };
  const existing = await getPrisma().issueCategory.findFirst({ where: { OR: [{ name: parsed.data.name }, { slug }] }, select: { id: true } });
  if (existing) return { message: "A category with that name already exists." };

  const category = await getPrisma().$transaction(async (tx) => {
    const created = await tx.issueCategory.create({ data: { slug, name: parsed.data.name, description: parsed.data.description || null } });
    await tx.auditLog.create({ data: { action: "ISSUE_CATEGORY_CREATED", entityType: "IssueCategory", entityId: created.id, actorId: admin.id, metadata: { slug } } });
    return created;
  });
  refreshOperations();
  return { success: `${category.name} was added.` };
}

export async function updateCategoryStatus(_previousState: AdminOperationState = initialState, formData: FormData): Promise<AdminOperationState> {
  void _previousState;
  const admin = await requireRole([UserRole.ADMIN]);
  const categoryId = formData.get("categoryId");
  const isActive = formData.get("isActive");
  if (typeof categoryId !== "string" || !categoryId || (isActive !== "true" && isActive !== "false")) return { message: "Invalid category update." };
  const category = await getPrisma().issueCategory.update({ where: { id: categoryId }, data: { isActive: isActive === "true" } });
  await getPrisma().auditLog.create({ data: { action: category.isActive ? "ISSUE_CATEGORY_ACTIVATED" : "ISSUE_CATEGORY_DEACTIVATED", entityType: "IssueCategory", entityId: category.id, actorId: admin.id } });
  refreshOperations();
  return { success: `${category.name} is now ${category.isActive ? "active" : "inactive"}.` };
}

function readTeam(formData: FormData) {
  return teamSchema.safeParse({ name: formData.get("name"), contactEmail: formData.get("contactEmail") ?? "", memberIds: formData.getAll("memberIds").filter((value): value is string => typeof value === "string") });
}

async function validStaffMemberIds(memberIds: string[]) {
  const staff = await getPrisma().user.findMany({ where: { id: { in: memberIds }, role: UserRole.STAFF, status: UserStatus.ACTIVE }, select: { id: true } });
  return staff.map((person) => person.id);
}

export async function createResponseTeam(_previousState: AdminOperationState = initialState, formData: FormData): Promise<AdminOperationState> {
  void _previousState;
  const admin = await requireRole([UserRole.ADMIN]);
  const parsed = readTeam(formData);
  if (!parsed.success) return { errors: parsed.error.flatten().fieldErrors };
  const duplicate = await getPrisma().responseTeam.findFirst({ where: { name: parsed.data.name, serviceAreaId: null }, select: { id: true } });
  if (duplicate) return { message: "A response team with that name already exists." };
  const memberIds = await validStaffMemberIds(parsed.data.memberIds);
  const team = await getPrisma().$transaction(async (tx) => {
    const created = await tx.responseTeam.create({ data: { name: parsed.data.name, contactEmail: parsed.data.contactEmail || null, members: memberIds.length ? { createMany: { data: memberIds.map((userId) => ({ userId })) } } : undefined } });
    await tx.auditLog.create({ data: { action: "RESPONSE_TEAM_CREATED", entityType: "ResponseTeam", entityId: created.id, actorId: admin.id, metadata: { memberCount: memberIds.length } } });
    return created;
  });
  refreshOperations();
  return { success: `${team.name} was created.` };
}

export async function updateResponseTeam(_previousState: AdminOperationState = initialState, formData: FormData): Promise<AdminOperationState> {
  void _previousState;
  const admin = await requireRole([UserRole.ADMIN]);
  const teamId = formData.get("teamId");
  const isActive = formData.get("isActive");
  if (typeof teamId !== "string" || !teamId || (isActive !== "true" && isActive !== "false")) return { message: "Invalid response team update." };
  const parsed = readTeam(formData);
  if (!parsed.success) return { errors: parsed.error.flatten().fieldErrors };
  const memberIds = await validStaffMemberIds(parsed.data.memberIds);
  const team = await getPrisma().$transaction(async (tx) => {
    const updated = await tx.responseTeam.update({ where: { id: teamId }, data: { name: parsed.data.name, contactEmail: parsed.data.contactEmail || null, isActive: isActive === "true" } });
    await tx.teamMember.deleteMany({ where: { teamId } });
    if (memberIds.length) await tx.teamMember.createMany({ data: memberIds.map((userId) => ({ teamId, userId })) });
    await tx.auditLog.create({ data: { action: "RESPONSE_TEAM_UPDATED", entityType: "ResponseTeam", entityId: teamId, actorId: admin.id, metadata: { isActive: updated.isActive, memberCount: memberIds.length } } });
    return updated;
  });
  refreshOperations();
  return { success: `${team.name} was updated.` };
}
