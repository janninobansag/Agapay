import { Bell, Check, ExternalLink } from "lucide-react";
import Link from "next/link";
import { markAllNotificationsRead, markNotificationRead } from "@/server/actions/notifications";
import { getResidentNotifications } from "@/server/queries/notifications";

export const metadata = { title: "Notifications" };
export const dynamic = "force-dynamic";

function formatDate(value: Date) {
  return new Intl.DateTimeFormat("en-PH", { dateStyle: "medium", timeStyle: "short", timeZone: "Asia/Manila" }).format(value);
}

export default async function NotificationsPage() {
  const notifications = await getResidentNotifications();
  const unreadCount = notifications.filter((item) => !item.readAt).length;
  return <div><div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end"><div><p className="text-sm font-bold uppercase tracking-[0.14em] text-brand">Notifications</p><h1 className="mt-2 text-3xl font-bold tracking-[-0.04em] text-brand-dark">Your latest updates</h1><p className="mt-2 text-muted">Status and assignment updates for your reports.</p></div>{unreadCount > 0 && <form action={markAllNotificationsRead}><button className="inline-flex items-center gap-2 rounded-full border border-border bg-surface px-4 py-2 text-sm font-bold text-brand-dark" type="submit"><Check size={16} /> Mark all read</button></form>}</div>
  {notifications.length === 0 ? <div className="mt-8 rounded-3xl border border-border bg-surface p-12 text-center"><Bell className="mx-auto text-brand" size={30} /><h2 className="mt-4 font-bold text-brand-dark">You are all caught up</h2><p className="mt-2 text-sm text-muted">Report updates will appear here.</p></div> : <div className="mt-8 overflow-hidden rounded-3xl border border-border bg-surface"><ul className="divide-y divide-border">{notifications.map((notification) => <li className={`p-5 sm:p-6 ${notification.readAt ? "" : "bg-brand-soft/30"}`} key={notification.id}><div className="flex gap-4"><span className={`mt-1 size-2 shrink-0 rounded-full ${notification.readAt ? "bg-border" : "bg-brand"}`} /><div className="min-w-0 flex-1"><div className="flex flex-wrap items-start justify-between gap-2"><h2 className="font-bold text-brand-dark">{notification.title}</h2><time className="text-xs text-muted">{formatDate(notification.createdAt)}</time></div><p className="mt-2 text-sm leading-6 text-muted">{notification.body}</p><div className="mt-3 flex flex-wrap gap-4">{notification.report && <Link className="inline-flex items-center gap-1 text-sm font-bold text-brand" href={`/reports/${notification.report.publicId}`}>View {notification.report.publicId} <ExternalLink size={14} /></Link>}{!notification.readAt && <form action={markNotificationRead.bind(null, notification.id)}><button className="text-sm font-bold text-muted" type="submit">Mark as read</button></form>}</div></div></div></li>)}</ul></div>}</div>;
}
