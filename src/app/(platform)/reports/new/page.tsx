import { Camera, Info, MapPin } from "lucide-react";
import { DatabaseState } from "@/components/feedback/database-state";
import { getActiveCategories } from "@/server/queries/categories";

export const metadata = { title: "Report an issue" };
export const dynamic = "force-dynamic";

export default async function NewReportPage() {
  const { data: categories, availability } = await getActiveCategories();

  return (
    <div className="mx-auto max-w-3xl">
      <DatabaseState availability={availability} />
      <div><p className="text-sm font-bold uppercase tracking-[0.14em] text-brand">New report</p><h1 className="mt-2 text-3xl font-bold tracking-[-0.04em] text-brand-dark">Tell us what needs attention</h1><p className="mt-2 text-muted">Clear information helps the right team respond sooner.</p></div>
      <form className="mt-8 space-y-6 rounded-3xl border border-border bg-surface p-5 sm:p-8">
        <div>
          <label className="text-sm font-bold text-brand-dark" htmlFor="category">Issue category</label>
          <select className="mt-2 h-12 w-full rounded-xl border border-border bg-background px-3 text-sm" defaultValue="" id="category" name="category" required>
            <option disabled value="">Select a category</option>
            {categories.map((category) => <option key={category.id} value={category.id}>{category.name}</option>)}
          </select>
        </div>
        <div>
          <label className="text-sm font-bold text-brand-dark" htmlFor="title">Short title</label>
          <input className="mt-2 h-12 w-full rounded-xl border border-border bg-background px-4 text-sm placeholder:text-muted" id="title" maxLength={100} name="title" placeholder="Example: Streetlight not working" required />
        </div>
        <div>
          <label className="text-sm font-bold text-brand-dark" htmlFor="description">Description</label>
          <textarea className="mt-2 min-h-36 w-full resize-y rounded-xl border border-border bg-background p-4 text-sm placeholder:text-muted" id="description" maxLength={1000} name="description" placeholder="Describe what happened, when you noticed it, and any immediate risk." required />
          <p className="mt-2 flex items-center gap-1.5 text-xs text-muted"><Info size={14} /> Avoid including private or sensitive information.</p>
        </div>
        <div>
          <label className="text-sm font-bold text-brand-dark" htmlFor="location">Location</label>
          <div className="relative mt-2"><MapPin className="absolute left-3 top-3.5 text-muted" size={19} /><input className="h-12 w-full rounded-xl border border-border bg-background pl-10 pr-4 text-sm placeholder:text-muted" id="location" name="location" placeholder="Street, landmark, or area" required /></div>
          <button className="mt-2 text-sm font-bold text-brand" type="button">Choose on map</button>
        </div>
        <div>
          <p className="text-sm font-bold text-brand-dark">Photo evidence <span className="font-normal text-muted">(optional)</span></p>
          <label className="mt-2 flex min-h-36 cursor-pointer flex-col items-center justify-center rounded-2xl border border-dashed border-brand/35 bg-brand-soft/35 p-5 text-center hover:bg-brand-soft/60" htmlFor="photo"><Camera className="text-brand" size={25} /><span className="mt-3 text-sm font-bold text-brand-dark">Upload a clear photo</span><span className="mt-1 text-xs text-muted">PNG or JPG, up to 10 MB</span><input accept="image/png,image/jpeg" className="sr-only" id="photo" name="photo" type="file" /></label>
        </div>
        <div className="flex flex-col-reverse gap-3 border-t border-border pt-6 sm:flex-row sm:justify-end">
          <button className="rounded-full border border-border px-6 py-3 text-sm font-bold text-brand-dark hover:bg-surface-muted" type="button">Save draft</button>
          <button className="rounded-full bg-brand px-6 py-3 text-sm font-bold text-white enabled:hover:bg-brand-dark disabled:cursor-not-allowed disabled:opacity-50" disabled={availability !== "ready"} type="submit">Submit report</button>
        </div>
      </form>
      <p className="mt-4 text-center text-xs leading-5 text-muted">The data foundation now supplies categories from PostgreSQL. Report submission will be connected during the reporting workflow milestone.</p>
    </div>
  );
}
