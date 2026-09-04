import { cache } from "react";
import { redirect } from "next/navigation";
import type { UserRole } from "@prisma/client";
import { UserStatus } from "@prisma/client";
import { auth } from "@/auth";
import { getPrisma } from "@/lib/db/prisma";

export type CurrentUser = {
  id: string;
  email: string;
  name: string;
  role: UserRole;
};

export const getCurrentUser = cache(async (): Promise<CurrentUser | null> => {
  const session = await auth();
  if (!session?.user?.id) return null;

  return getPrisma().user.findFirst({
    where: {
      id: session.user.id,
      status: UserStatus.ACTIVE,
    },
    select: {
      id: true,
      email: true,
      name: true,
      role: true,
    },
  });
});

export async function requireUser() {
  const user = await getCurrentUser();
  if (!user) redirect("/sign-in");
  return user;
}

export async function requireRole(allowedRoles: readonly UserRole[]) {
  const user = await requireUser();
  if (!allowedRoles.includes(user.role)) redirect("/post-login?error=forbidden");
  return user;
}
