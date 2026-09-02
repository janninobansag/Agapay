import { Bell } from "lucide-react";

export const metadata = { title: "Notifications" };

export default function NotificationsPage() {
  return <div><p className="text-sm font-bold uppercase tracking-[0.14em] text-brand">Notifications</p><h1 className="mt-2 text-3xl font-bold tracking-[-0.04em] text-brand-dark">Your latest updates</h1><div className="mt-8 rounded-3xl border border-border bg-surface p-12 text-center"><Bell className="mx-auto text-brand" size={30} /><h2 className="mt-4 font-bold text-brand-dark">You are all caught up</h2><p className="mt-2 text-sm text-muted">Report and community updates will appear here.</p></div></div>;
}

