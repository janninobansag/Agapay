"use server";

import { Prisma, type ReportStatus } from "@prisma/client";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createReportSchema, draftReportSchema, staffTransitionSchema } from "@/features/reports/schemas";
import { requireRole } from "@/lib/auth/user";
import { getPrisma } from "@/lib/db/prisma";
import { canCancelReport, canEditReport, getStaffTransition } from "@/lib/permissions/reports";
import { createReportPublicId } from "@/lib/reports/public-id";
import { removeEvidence, uploadEvidence } from "@/lib/storage/evidence";

export type ReportFormState = { message?: string; errors?: Record<string, string[]> };

function reportInput(formData: FormData) {
  const coordinate = (name: string) => {
    const value = formData.get(name);
    return typeof value === "string" && value.trim() ? Number(value) : null;
  };
  return {
    categoryId: formData.get("categoryId"),
    title: formData.get("title"),
    description: formData.get("description"),
    address: formData.get("address"),
    latitude: coordinate("latitude"),
    longitude: coordinate("longitude"),
    saveAsDraft: formData.get("intent") === "draft",
  };
}

function errorMessage(error: unknown) {
  return error instanceof Error ? error.message : "Something went wrong. Please try again.";
}

async function validateCategory(categoryId: string) {
  return getPrisma().issueCategory.findFirst({ where: { id: categoryId, isActive: true }, select: { id: true } });
}

export async function createReport(
  _previousState: ReportFormState,
  formData: FormData,
): Promise<ReportFormState> {
  const user = await requireRole(["RESIDENT"]);
  const isDraft = formData.get("intent") === "draft";
  const parsed = (isDraft ? draftReportSchema : createReportSchema).safeParse(reportInput(formData));
  if (!parsed.success) return { errors: parsed.error.flatten().fieldErrors };
  if (!(await validateCategory(parsed.data.categoryId))) return { message: "That category is no longer available." };

  const publicId = createReportPublicId();
  const photo = formData.get("photo");
  let media: Awaited<ReturnType<typeof uploadEvidence>> | null = null;
  try {
    if (photo instanceof File && photo.size > 0) media = await uploadEvidence(photo, user.id, publicId);
    await getPrisma().$transaction(async (tx) => {
      const report = await tx.report.create({
        data: {
          publicId,
          reporterId: user.id,
          categoryId: parsed.data.categoryId,
          title: parsed.data.title,
          description: parsed.data.description,
          address: parsed.data.address,
          latitude: parsed.data.latitude,
          longitude: parsed.data.longitude,
          status: isDraft ? "DRAFT" : "SUBMITTED",
          submittedAt: isDraft ? null : new Date(),
          media: media ? { create: media } : undefined,
        },
      });
      await tx.reportStatusEvent.create({ data: { reportId: report.id, actorId: user.id, toStatus: report.status, note: isDraft ? "Saved by the resident." : "Submitted for staff review." } });
      await tx.auditLog.create({ data: { action: isDraft ? "REPORT_DRAFT_CREATED" : "REPORT_SUBMITTED", entityType: "Report", entityId: report.id, actorId: user.id, metadata: { publicId } } });
    });
  } catch (error) {
    if (media) await removeEvidence(media.objectKey);
    return { message: errorMessage(error) };
  }
  revalidatePath("/dashboard");
  revalidatePath("/reports");
  redirect(`/reports/${publicId}`);
}

export async function updateReport(
  publicId: string,
  _previousState: ReportFormState,
  formData: FormData,
): Promise<ReportFormState> {
  const user = await requireRole(["RESIDENT"]);
  const existing = await getPrisma().report.findFirst({ where: { publicId, reporterId: user.id }, include: { media: { select: { id: true } } } });
  if (!existing) return { message: "Report not found." };
  if (!canEditReport(existing.status)) return { message: "This report can no longer be edited." };
  const isDraft = formData.get("intent") === "draft";
  const parsed = (isDraft ? draftReportSchema : createReportSchema).safeParse(reportInput(formData));
  if (!parsed.success) return { errors: parsed.error.flatten().fieldErrors };
  if (!(await validateCategory(parsed.data.categoryId))) return { message: "That category is no longer available." };

  const photo = formData.get("photo");
  let media: Awaited<ReturnType<typeof uploadEvidence>> | null = null;
  try {
    if (photo instanceof File && photo.size > 0) {
      if (existing.media.length >= 3) return { message: "A report can contain up to three evidence images." };
      media = await uploadEvidence(photo, user.id, publicId);
    }
    const nextStatus: ReportStatus = isDraft && existing.status === "DRAFT" ? "DRAFT" : "SUBMITTED";
    await getPrisma().$transaction(async (tx) => {
      const current = await tx.report.findUnique({ where: { id: existing.id }, select: { status: true } });
      if (!current || current.status !== existing.status || !canEditReport(current.status)) throw new Error("The report changed while you were editing it. Refresh and try again.");
      await tx.report.update({ where: { id: existing.id }, data: { categoryId: parsed.data.categoryId, title: parsed.data.title, description: parsed.data.description, address: parsed.data.address, latitude: parsed.data.latitude, longitude: parsed.data.longitude, status: nextStatus, submittedAt: nextStatus === "SUBMITTED" ? existing.submittedAt ?? new Date() : null, media: media ? { create: media } : undefined } });
      if (existing.status !== nextStatus) await tx.reportStatusEvent.create({ data: { reportId: existing.id, actorId: user.id, fromStatus: existing.status, toStatus: nextStatus, note: "Draft submitted for staff review." } });
      await tx.auditLog.create({ data: { action: existing.status !== nextStatus ? "REPORT_SUBMITTED" : "REPORT_UPDATED", entityType: "Report", entityId: existing.id, actorId: user.id, metadata: { publicId, evidenceAdded: Boolean(media) } } });
    });
  } catch (error) {
    if (media) await removeEvidence(media.objectKey);
    return { message: errorMessage(error) };
  }
  revalidatePath("/dashboard");
  revalidatePath("/reports");
  revalidatePath(`/reports/${publicId}`);
  redirect(`/reports/${publicId}`);
}

export async function cancelReport(publicId: string) {
  const user = await requireRole(["RESIDENT"]);
  const report = await getPrisma().report.findFirst({ where: { publicId, reporterId: user.id } });
  if (!report || !canCancelReport(report.status)) return;
  await getPrisma().$transaction(async (tx) => {
    const updated = await tx.report.updateMany({ where: { id: report.id, status: report.status }, data: { status: "CANCELLED" } });
    if (updated.count !== 1) throw new Error("The report status changed. Refresh and try again.");
    await tx.reportStatusEvent.create({ data: { reportId: report.id, actorId: user.id, fromStatus: report.status, toStatus: "CANCELLED", note: "Cancelled by the resident." } });
    await tx.auditLog.create({ data: { action: "REPORT_CANCELLED", entityType: "Report", entityId: report.id, actorId: user.id, metadata: { publicId } } });
  });
  revalidatePath("/dashboard");
  revalidatePath("/reports");
  revalidatePath(`/reports/${publicId}`);
}

export async function transitionReport(formData: FormData) {
  const user = await requireRole(["STAFF", "ADMIN"]);
  const parsed = staffTransitionSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return;
  const report = await getPrisma().report.findUnique({ where: { publicId: parsed.data.reportId } });
  if (!report) return;
  const nextStatus = getStaffTransition(report.status, parsed.data.transition);
  if (!nextStatus) return;
  if (["reject", "resolve"].includes(parsed.data.transition) && !parsed.data.note) return;
  const isAssignment = parsed.data.transition === "assign";
  if (isAssignment && !parsed.data.assignedTeamId && !parsed.data.assignedStaffId) return;

  if (parsed.data.assignedTeamId) {
    const team = await getPrisma().responseTeam.findFirst({ where: { id: parsed.data.assignedTeamId, isActive: true } });
    if (!team) return;
  }
  if (parsed.data.assignedStaffId) {
    const staff = await getPrisma().user.findFirst({ where: { id: parsed.data.assignedStaffId, role: { in: ["STAFF", "ADMIN"] }, status: "ACTIVE" } });
    if (!staff) return;
  }

  const now = new Date();
  await getPrisma().$transaction(async (tx) => {
    const updated = await tx.report.updateMany({ where: { id: report.id, status: report.status }, data: isAssignment ? { assignedTeamId: parsed.data.assignedTeamId || null, assignedStaffId: parsed.data.assignedStaffId || null } : { status: nextStatus, verifiedAt: nextStatus === "VERIFIED" ? now : undefined, resolvedAt: nextStatus === "RESOLVED" ? now : undefined } });
    if (updated.count !== 1) throw new Error("The report status changed. Refresh and try again.");
    if (!isAssignment) await tx.reportStatusEvent.create({ data: { reportId: report.id, actorId: user.id, fromStatus: report.status, toStatus: nextStatus, note: parsed.data.note || undefined } });
    await tx.auditLog.create({ data: { action: `REPORT_${parsed.data.transition.toUpperCase()}`, entityType: "Report", entityId: report.id, actorId: user.id, metadata: { publicId: report.publicId, fromStatus: report.status, toStatus: nextStatus, assignedTeamId: parsed.data.assignedTeamId || null, assignedStaffId: parsed.data.assignedStaffId || null } as Prisma.InputJsonObject } });
    await tx.notification.create({ data: { userId: report.reporterId, reportId: report.id, type: nextStatus === "RESOLVED" ? "REPORT_RESOLVED" : nextStatus === "REJECTED" ? "REPORT_REJECTED" : isAssignment ? "REPORT_ASSIGNED" : nextStatus === "VERIFIED" ? "REPORT_VERIFIED" : "REPORT_UPDATED", title: isAssignment ? "Report assigned" : `Report ${nextStatus.toLowerCase().replace("_", " ")}`, body: parsed.data.note || `The status of ${report.publicId} has been updated.` } });
  });
  revalidatePath("/staff");
  revalidatePath(`/staff/reports/${report.publicId}`);
  revalidatePath(`/reports/${report.publicId}`);
}
