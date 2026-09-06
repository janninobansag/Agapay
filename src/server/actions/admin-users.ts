"use server";

import { hash } from "bcryptjs";
import { Prisma, UserRole, UserStatus } from "@prisma/client";
import { revalidatePath } from "next/cache";
import { adminPasswordResetSchema, createStaffSchema } from "@/features/auth/schemas";
import { requireRole } from "@/lib/auth/user";
import { getPrisma } from "@/lib/db/prisma";

export type AdminUserActionState = {
  message?: string;
  success?: string;
  errors?: Record<string, string[]>;
};

const initialAdminActionState: AdminUserActionState = {};

function refreshUserDirectory() {
  revalidatePath("/admin");
  revalidatePath("/admin/users");
}

export async function createStaffAccount(
  _previousState: AdminUserActionState = initialAdminActionState,
  formData: FormData,
): Promise<AdminUserActionState> {
  void _previousState;
  const admin = await requireRole([UserRole.ADMIN]);
  const parsed = createStaffSchema.safeParse({
    name: formData.get("name"),
    email: formData.get("email"),
    password: formData.get("password"),
    confirmPassword: formData.get("confirmPassword"),
  });
  if (!parsed.success) return { errors: parsed.error.flatten().fieldErrors };

  try {
    const passwordHash = await hash(parsed.data.password, 12);
    const staff = await getPrisma().$transaction(async (tx) => {
      const created = await tx.user.create({
        data: {
          name: parsed.data.name,
          email: parsed.data.email,
          passwordHash,
          role: UserRole.STAFF,
          status: UserStatus.ACTIVE,
        },
      });
      await tx.auditLog.create({
        data: {
          action: "STAFF_ACCOUNT_CREATED",
          entityType: "User",
          entityId: created.id,
          actorId: admin.id,
          metadata: { role: UserRole.STAFF },
        },
      });
      return created;
    });
    refreshUserDirectory();
    return { success: `${staff.name} can now sign in as staff.` };
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
      return { message: "An account with that email already exists." };
    }
    throw error;
  }
}

export async function updateUserAccess(
  _previousState: AdminUserActionState = initialAdminActionState,
  formData: FormData,
): Promise<AdminUserActionState> {
  void _previousState;
  const admin = await requireRole([UserRole.ADMIN]);
  const userId = formData.get("userId");
  const nextStatus = formData.get("nextStatus");
  if (typeof userId !== "string" || !userId || (nextStatus !== UserStatus.ACTIVE && nextStatus !== UserStatus.DEACTIVATED)) {
    return { message: "Invalid account access request." };
  }
  const requestedStatus = nextStatus;

  const target = await getPrisma().user.findUnique({
    where: { id: userId },
    select: { id: true, name: true, role: true, username: true },
  });
  if (!target) return { message: "Account not found." };
  if (target.id === admin.id || target.role === UserRole.ADMIN || target.username === "admin") {
    return { message: "The fixed administrator account cannot be deactivated." };
  }

  await getPrisma().$transaction(async (tx) => {
    await tx.user.update({ where: { id: target.id }, data: { status: requestedStatus } });
    await tx.auditLog.create({
      data: {
        action: requestedStatus === UserStatus.DEACTIVATED ? "USER_DEACTIVATED" : "USER_REACTIVATED",
        entityType: "User",
        entityId: target.id,
        actorId: admin.id,
        metadata: { role: target.role },
      },
    });
  });
  refreshUserDirectory();
  return { success: `${target.name}'s account was ${requestedStatus === UserStatus.DEACTIVATED ? "deactivated" : "reactivated"}.` };
}

export async function resetUserPassword(
  _previousState: AdminUserActionState = initialAdminActionState,
  formData: FormData,
): Promise<AdminUserActionState> {
  void _previousState;
  const admin = await requireRole([UserRole.ADMIN]);
  const parsed = adminPasswordResetSchema.safeParse({
    userId: formData.get("userId"),
    password: formData.get("password"),
    confirmPassword: formData.get("confirmPassword"),
  });
  if (!parsed.success) return { errors: parsed.error.flatten().fieldErrors };

  const target = await getPrisma().user.findUnique({
    where: { id: parsed.data.userId },
    select: { id: true, name: true, role: true, username: true },
  });
  if (!target) return { message: "Account not found." };
  if (target.id === admin.id || target.role === UserRole.ADMIN || target.username === "admin") {
    return { message: "The fixed administrator password cannot be changed here." };
  }

  const passwordHash = await hash(parsed.data.password, 12);
  await getPrisma().$transaction(async (tx) => {
    await tx.user.update({ where: { id: target.id }, data: { passwordHash } });
    await tx.auditLog.create({
      data: {
        action: "USER_PASSWORD_RESET",
        entityType: "User",
        entityId: target.id,
        actorId: admin.id,
      },
    });
  });
  refreshUserDirectory();
  return { success: `Password changed for ${target.name}.` };
}

export async function permanentlyDeleteUser(
  _previousState: AdminUserActionState = initialAdminActionState,
  formData: FormData,
): Promise<AdminUserActionState> {
  void _previousState;
  const admin = await requireRole([UserRole.ADMIN]);
  const userId = formData.get("userId");
  const confirmation = formData.get("confirmation");
  if (typeof userId !== "string" || !userId || typeof confirmation !== "string") {
    return { message: "Invalid permanent deletion request." };
  }

  const target = await getPrisma().user.findUnique({
    where: { id: userId },
    select: { id: true, name: true, email: true, role: true, username: true, _count: { select: { reports: true } } },
  });
  if (!target) return { message: "Account not found." };
  if (target.id === admin.id || target.role === UserRole.ADMIN || target.username === "admin") {
    return { message: "The fixed administrator account cannot be permanently deleted." };
  }
  if (confirmation.trim() !== `DELETE ${target.email}`) {
    return { message: `Type DELETE ${target.email} exactly to confirm.` };
  }

  try {
    await getPrisma().$transaction(async (tx) => {
      await tx.auditLog.create({
        data: {
          action: "USER_PERMANENTLY_DELETED",
          entityType: "User",
          entityId: target.id,
          actorId: admin.id,
          metadata: { deletedEmail: target.email, deletedRole: target.role, deletedReportCount: target._count.reports },
        },
      });
      await tx.user.delete({ where: { id: target.id } });
    });
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2003") {
      return { message: "The database cascade-delete migration has not been applied yet. Run npm run db:deploy, then try again." };
    }
    if (error instanceof Prisma.PrismaClientUnknownRequestError && error.message.includes("AuditLog rows are immutable")) {
      return { message: "The database audit-anonymization migration has not been applied yet. Run npm run db:deploy, then try again." };
    }
    throw error;
  }
  refreshUserDirectory();
  return { success: `${target.name} and ${target._count.reports} related report(s) were permanently deleted.` };
}
