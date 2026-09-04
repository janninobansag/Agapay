"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { Bell, CircleUserRound, Mail } from "lucide-react";
import { updateNotificationSettings, updateProfileSettings, type SettingsState } from "@/server/actions/settings";

function SaveButton() {
  const { pending } = useFormStatus();
  return <button className="rounded-full bg-brand px-5 py-2.5 text-sm font-bold text-white disabled:cursor-wait disabled:opacity-60" disabled={pending} type="submit">{pending ? "Saving…" : "Save changes"}</button>;
}

function Feedback({ state }: { state: SettingsState }) {
  if (!state.message) return null;
  return <p className={`text-sm font-semibold ${state.success ? "text-brand" : "text-red-700"}`} role="status">{state.message}</p>;
}

export function ProfileSettingsForm({ email, name }: { email: string; name: string }) {
  const [state, action] = useActionState(updateProfileSettings, {});
  return <form action={action} className="rounded-3xl border border-border bg-surface p-6 sm:p-8"><div className="flex items-start gap-3"><span className="grid size-10 shrink-0 place-items-center rounded-xl bg-brand-soft text-brand"><CircleUserRound size={20} /></span><div><h2 className="font-bold text-brand-dark">Profile</h2><p className="mt-1 text-sm text-muted">This name appears in your account and report history.</p></div></div><div className="mt-6 grid gap-5 sm:grid-cols-2"><div><label className="text-sm font-bold text-brand-dark" htmlFor="name">Display name</label><input className="mt-2 h-12 w-full rounded-xl border border-border bg-background px-4 text-sm" defaultValue={name} id="name" maxLength={100} name="name" required />{state.errors?.name?.[0] && <p className="mt-1 text-xs text-red-700">{state.errors.name[0]}</p>}</div><div><label className="text-sm font-bold text-brand-dark" htmlFor="email">Email address</label><div className="relative mt-2"><Mail className="absolute left-3 top-3.5 text-muted" size={18} /><input className="h-12 w-full rounded-xl border border-border bg-surface-muted pl-10 pr-4 text-sm text-muted" disabled id="email" value={email} /></div><p className="mt-1 text-xs text-muted">Email changes require a verified-email workflow.</p></div></div><div className="mt-6 flex flex-wrap items-center justify-between gap-3 border-t border-border pt-5"><Feedback state={state} /><SaveButton /></div></form>;
}

export function NotificationSettingsForm({ enabled }: { enabled: boolean }) {
  const [state, action] = useActionState(updateNotificationSettings, {});
  return <form action={action} className="rounded-3xl border border-border bg-surface p-6 sm:p-8"><div className="flex items-start gap-3"><span className="grid size-10 shrink-0 place-items-center rounded-xl bg-brand-soft text-brand"><Bell size={20} /></span><div><h2 className="font-bold text-brand-dark">Notifications</h2><p className="mt-1 text-sm text-muted">Choose whether new report-status updates appear in your Agapay inbox.</p></div></div><label className="mt-6 flex cursor-pointer items-start justify-between gap-6 rounded-2xl border border-border bg-background p-4" htmlFor="inAppNotificationsEnabled"><span><span className="block text-sm font-bold text-brand-dark">In-app report updates</span><span className="mt-1 block text-xs leading-5 text-muted">Submission confirmations and future staff updates. Existing notifications remain available.</span></span><input className="mt-1 size-5 accent-[var(--brand)]" defaultChecked={enabled} id="inAppNotificationsEnabled" name="inAppNotificationsEnabled" type="checkbox" /></label><div className="mt-6 flex flex-wrap items-center justify-between gap-3 border-t border-border pt-5"><Feedback state={state} /><SaveButton /></div></form>;
}
