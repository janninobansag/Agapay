import { LogOut } from "lucide-react";
import { logout } from "@/server/actions/auth";

export function SignOutButton() {
  return (
    <form action={logout}>
      <button className="flex w-full items-center gap-2 rounded-lg px-2 py-2 text-xs font-bold text-muted hover:bg-white hover:text-brand-dark" type="submit">
        <LogOut aria-hidden="true" size={15} /> Sign out
      </button>
    </form>
  );
}

