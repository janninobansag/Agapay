import { NotificationSettingsForm, ProfileSettingsForm } from "@/features/settings/components/settings-forms";
import { getResidentSettings } from "@/server/queries/settings";

export const metadata = { title: "Settings" };
export const dynamic = "force-dynamic";

export default async function SettingsPage() {
  const settings = await getResidentSettings();
  return <div className="mx-auto max-w-4xl"><p className="text-sm font-bold uppercase tracking-[0.14em] text-brand">Settings</p><h1 className="mt-2 text-3xl font-bold tracking-[-0.04em] text-brand-dark">Account preferences</h1><p className="mt-2 text-muted">Manage how your name appears and how Agapay delivers report updates.</p><div className="mt-8 grid gap-5"><ProfileSettingsForm email={settings.email} name={settings.name} /><NotificationSettingsForm enabled={settings.inAppNotificationsEnabled} /></div><section className="mt-5 rounded-3xl border border-border bg-surface-muted p-6"><h2 className="font-bold text-brand-dark">Account security</h2><p className="mt-2 text-sm leading-6 text-muted">Password changes and email verification are intentionally deferred until secure reset and verification email delivery are available. Sign out when using a shared device.</p></section></div>;
}
