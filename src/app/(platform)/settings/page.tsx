export const metadata = { title: "Settings" };

export default function SettingsPage() {
  return <div><p className="text-sm font-bold uppercase tracking-[0.14em] text-brand">Settings</p><h1 className="mt-2 text-3xl font-bold tracking-[-0.04em] text-brand-dark">Account preferences</h1><div className="mt-8 rounded-3xl border border-border bg-surface p-6"><h2 className="font-bold text-brand-dark">Profile and notifications</h2><p className="mt-2 text-sm leading-6 text-muted">These controls will become available when authentication and persistent user profiles are implemented.</p></div></div>;
}

