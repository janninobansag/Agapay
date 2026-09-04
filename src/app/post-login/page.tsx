import { redirect } from "next/navigation";
import { requireUser } from "@/lib/auth/user";

export default async function PostLoginPage() {
  const user = await requireUser();

  if (user.role === "ADMIN") redirect("/admin");
  if (user.role === "STAFF") redirect("/staff");
  redirect("/dashboard");
}

