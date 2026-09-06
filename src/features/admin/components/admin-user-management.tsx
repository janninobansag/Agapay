"use client";

import { KeyRound, Trash2, UserMinus, UserPlus, UserRoundCheck } from "lucide-react";
import { useActionState, useState } from "react";
import {
  createStaffAccount,
  permanentlyDeleteUser,
  resetUserPassword,
  updateUserAccess,
  type AdminUserActionState,
} from "@/server/actions/admin-users";

type ManagedUser = {
  id: string;
  name: string;
  email: string;
  username: string | null;
  role: "RESIDENT" | "STAFF" | "ADMIN";
  status: "ACTIVE" | "SUSPENDED" | "DEACTIVATED";
};

const initialState: AdminUserActionState = {};

function FieldErrors({ errors }: { errors?: string[] }) {
  return errors?.map((error) => <p className="mt-1 text-xs text-rose-700" key={error}>{error}</p>);
}

function PasswordReset({ user, currentUserId }: { user: ManagedUser; currentUserId: string }) {
  const [isOpen, setIsOpen] = useState(false);
  const [state, formAction] = useActionState(resetUserPassword, initialState);
  if (user.role === "ADMIN" && user.id !== currentUserId) return <span className="text-xs text-muted">Protected account</span>;

  return (
    <div>
      <button className="inline-flex items-center gap-1 rounded-lg border border-border px-3 py-2 text-xs font-bold text-brand-dark hover:border-brand/40" onClick={() => setIsOpen((value) => !value)} type="button">
        <KeyRound aria-hidden="true" size={14} /> {user.id === currentUserId ? "Change my password" : "Reset password"}
      </button>
      {isOpen && (
        <form action={formAction} className="mt-3 grid gap-2 rounded-xl bg-surface-muted/70 p-3 sm:grid-cols-2">
          <input name="userId" type="hidden" value={user.id} />
          <label className="text-xs font-bold text-brand-dark">New password
            <input autoComplete="new-password" className="mt-1 h-10 w-full rounded-lg border border-border bg-surface px-3 text-sm" minLength={8} name="password" required type="password" />
          </label>
          <label className="text-xs font-bold text-brand-dark">Confirm password
            <input autoComplete="new-password" className="mt-1 h-10 w-full rounded-lg border border-border bg-surface px-3 text-sm" minLength={8} name="confirmPassword" required type="password" />
          </label>
          <div className="sm:col-span-2"><FieldErrors errors={state.errors?.password} /><FieldErrors errors={state.errors?.confirmPassword} />{state.message && <p className="mt-1 text-xs text-rose-700">{state.message}</p>}{state.success && <p className="mt-1 text-xs text-brand">{state.success}</p>}</div>
          <button className="w-fit rounded-lg bg-brand px-3 py-2 text-xs font-bold text-white hover:bg-brand-dark" type="submit">Save new password</button>
        </form>
      )}
    </div>
  );
}

function AccessControl({ user }: { user: ManagedUser }) {
  const [state, formAction] = useActionState(updateUserAccess, initialState);
  if (user.role === "ADMIN") return null;
  const isDeactivated = user.status === "DEACTIVATED";

  return (
    <form action={formAction}>
      <input name="userId" type="hidden" value={user.id} />
      <input name="nextStatus" type="hidden" value={isDeactivated ? "ACTIVE" : "DEACTIVATED"} />
      <button className={isDeactivated ? "inline-flex items-center gap-1 rounded-lg border border-brand/30 px-3 py-2 text-xs font-bold text-brand hover:bg-brand-soft" : "inline-flex items-center gap-1 rounded-lg border border-rose-200 px-3 py-2 text-xs font-bold text-rose-700 hover:bg-rose-50"} type="submit">
        {isDeactivated ? <><UserRoundCheck aria-hidden="true" size={14} /> Reactivate</> : <><UserMinus aria-hidden="true" size={14} /> Deactivate</>}
      </button>
      {state.message && <p className="mt-1 max-w-44 text-xs text-rose-700">{state.message}</p>}
      {state.success && <p className="mt-1 max-w-44 text-xs text-brand">{state.success}</p>}
    </form>
  );
}

function PermanentDelete({ user }: { user: ManagedUser }) {
  const [isOpen, setIsOpen] = useState(false);
  const [state, formAction] = useActionState(permanentlyDeleteUser, initialState);
  if (user.role === "ADMIN") return null;

  return (
    <div>
      <button className="inline-flex items-center gap-1 rounded-lg px-3 py-2 text-xs font-bold text-rose-700 hover:bg-rose-50" onClick={() => setIsOpen((value) => !value)} type="button"><Trash2 aria-hidden="true" size={14} /> Permanently delete</button>
      {isOpen && (
        <form action={formAction} className="mt-3 rounded-xl border border-rose-200 bg-rose-50 p-3">
          <input name="userId" type="hidden" value={user.id} />
          <p className="text-xs font-bold text-rose-900">This permanently deletes {user.name}, their reports, notifications, and report history. It cannot be undone.</p>
          <label className="mt-3 block text-xs font-bold text-rose-900">Type <span className="font-mono">DELETE {user.email}</span> to confirm
            <input autoComplete="off" className="mt-1 h-10 w-full rounded-lg border border-rose-200 bg-surface px-3 text-sm text-brand-dark" name="confirmation" required type="text" />
          </label>
          {state.message && <p className="mt-2 text-xs text-rose-700">{state.message}</p>}
          {state.success && <p className="mt-2 text-xs text-brand">{state.success}</p>}
          <button className="mt-3 rounded-lg bg-rose-700 px-3 py-2 text-xs font-bold text-white hover:bg-rose-800" type="submit">Delete user permanently</button>
        </form>
      )}
    </div>
  );
}

export function AdminUserManagement({ currentUserId, users }: { currentUserId: string; users: ManagedUser[] }) {
  const [state, formAction] = useActionState(createStaffAccount, initialState);

  return (
    <div className="space-y-8">
      <section className="rounded-3xl border border-border bg-surface p-5 sm:p-6">
        <div className="flex items-start gap-3"><span className="grid size-10 shrink-0 place-items-center rounded-xl bg-brand-soft text-brand"><UserPlus aria-hidden="true" size={19} /></span><div><h2 className="font-bold text-brand-dark">Create a staff account</h2><p className="mt-1 text-sm text-muted">Only administrators can create staff access. Residents continue to register through the public sign-up page.</p></div></div>
        <form action={formAction} className="mt-5 grid gap-4 md:grid-cols-2">
          <label className="text-sm font-bold text-brand-dark">Full name<input autoComplete="name" className="mt-2 h-11 w-full rounded-xl border border-border bg-background px-3 text-sm" name="name" required /></label>
          <label className="text-sm font-bold text-brand-dark">Email address<input autoComplete="email" className="mt-2 h-11 w-full rounded-xl border border-border bg-background px-3 text-sm" name="email" required type="email" /></label>
          <label className="text-sm font-bold text-brand-dark">Temporary password<input autoComplete="new-password" className="mt-2 h-11 w-full rounded-xl border border-border bg-background px-3 text-sm" minLength={8} name="password" required type="password" /></label>
          <label className="text-sm font-bold text-brand-dark">Confirm password<input autoComplete="new-password" className="mt-2 h-11 w-full rounded-xl border border-border bg-background px-3 text-sm" minLength={8} name="confirmPassword" required type="password" /></label>
          <div className="md:col-span-2"><FieldErrors errors={state.errors?.name} /><FieldErrors errors={state.errors?.email} /><FieldErrors errors={state.errors?.password} /><FieldErrors errors={state.errors?.confirmPassword} />{state.message && <p className="mt-2 text-sm text-rose-700">{state.message}</p>}{state.success && <p className="mt-2 text-sm font-medium text-brand">{state.success}</p>}</div>
          <button className="w-fit rounded-full bg-brand px-5 py-3 text-sm font-bold text-white hover:bg-brand-dark" type="submit">Create staff account</button>
        </form>
      </section>

      <section className="overflow-x-auto rounded-2xl border border-border bg-surface">
        <table className="w-full min-w-4xl text-left text-sm">
          <thead className="border-b border-border bg-surface-muted text-xs uppercase tracking-wider text-muted"><tr><th className="p-4">User</th><th className="p-4">Role</th><th className="p-4">Status</th><th className="p-4">Account actions</th></tr></thead>
          <tbody className="divide-y divide-border">
            {users.map((user) => (
              <tr className="align-top" key={user.id}>
                <td className="p-4"><p className="font-bold text-brand-dark">{user.name}</p><p className="mt-1 text-xs text-muted">{user.email}</p>{user.username && <p className="mt-1 font-mono text-xs text-brand">@{user.username}</p>}</td>
                <td className="p-4 font-semibold">{user.role}</td>
                <td className="p-4"><span className={user.status === "ACTIVE" ? "rounded-full bg-brand-soft px-2.5 py-1 text-xs font-bold text-brand-dark" : "rounded-full bg-rose-50 px-2.5 py-1 text-xs font-bold text-rose-700"}>{user.status}</span></td>
                <td className="space-y-3 p-4"><AccessControl user={user} /><PasswordReset currentUserId={currentUserId} user={user} /><PermanentDelete user={user} /></td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
    </div>
  );
}
