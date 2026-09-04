import { CommunityMap } from "@/features/map/components/community-map";
import { getCommunityMapReports } from "@/server/queries/map";

export const metadata = { title: "Community map" };
export const dynamic = "force-dynamic";

export default async function MapPage() {
  const reports = await getCommunityMapReports();
  return <div><p className="text-sm font-bold uppercase tracking-[0.14em] text-brand">Community map</p><h1 className="mt-2 text-3xl font-bold tracking-[-0.04em] text-brand-dark">Verified issues around your area</h1><p className="mt-2 text-muted">Explore verified, active, and resolved community reports. Exact resident identity is never shown.</p><div className="mt-8 overflow-hidden rounded-3xl border border-border bg-surface"><CommunityMap reports={reports} /></div><p className="mt-3 text-xs text-muted">Showing {reports.length} geolocated {reports.length === 1 ? "report" : "reports"}. Select a marker for details.</p>{reports.length > 0 && <ul aria-label="Reports shown on the map" className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">{reports.map((report) => <li className="rounded-2xl border border-border bg-surface p-4" key={report.id}><p className="font-mono text-xs font-bold text-brand">{report.id} · {report.category}</p><h2 className="mt-1 font-bold text-brand-dark">{report.title}</h2><p className="mt-2 text-xs text-muted">{report.status}</p></li>)}</ul>}</div>;
}
