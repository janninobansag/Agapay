import { MapPin } from "lucide-react";

export const metadata = { title: "Community map" };

export default function MapPage() {
  return (
    <div><p className="text-sm font-bold uppercase tracking-[0.14em] text-brand">Community map</p><h1 className="mt-2 text-3xl font-bold tracking-[-0.04em] text-brand-dark">Issues around your area</h1><p className="mt-2 text-muted">Map integration will be added after reports are stored in the database.</p><div className="mt-8 grid min-h-[520px] place-items-center rounded-3xl border border-border bg-[radial-gradient(circle_at_center,var(--brand-soft),var(--surface-muted))]"><div className="text-center"><span className="mx-auto grid size-14 place-items-center rounded-2xl bg-surface text-brand shadow-sm"><MapPin size={27} /></span><p className="mt-4 font-bold text-brand-dark">Interactive community map</p><p className="mt-1 text-sm text-muted">Planned with MapLibre and OpenStreetMap</p></div></div></div>
  );
}

