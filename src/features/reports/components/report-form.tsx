"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { Camera, Info, MapPin } from "lucide-react";
import type { ReportFormState } from "@/server/actions/reports";

type Category = { id: string; name: string };
type InitialReport = { categoryId: string; title: string; description: string; address: string; latitude: number | null; longitude: number | null };

function Actions() {
  const { pending } = useFormStatus();
  return <div className="flex flex-col-reverse gap-3 border-t border-border pt-6 sm:flex-row sm:justify-end"><button className="rounded-full border border-border px-6 py-3 text-sm font-bold text-brand-dark disabled:opacity-50" disabled={pending} name="intent" type="submit" value="draft">{pending ? "Saving…" : "Save draft"}</button><button className="rounded-full bg-brand px-6 py-3 text-sm font-bold text-white disabled:opacity-50" disabled={pending} name="intent" type="submit" value="submit">{pending ? "Saving…" : "Submit report"}</button></div>;
}

export function ReportForm({ action, categories, initial }: { action: (state: ReportFormState, data: FormData) => Promise<ReportFormState>; categories: Category[]; initial?: InitialReport }) {
  const [state, formAction] = useActionState(action, {});
  const error = (name: string) => state.errors?.[name]?.[0];
  const field = "mt-2 w-full rounded-xl border border-border bg-background px-4 text-sm";
  return <form action={formAction} className="mt-8 space-y-6 rounded-3xl border border-border bg-surface p-5 sm:p-8">
    {state.message && <p className="rounded-xl bg-red-50 p-3 text-sm font-semibold text-red-700" role="alert">{state.message}</p>}
    <div><label className="text-sm font-bold text-brand-dark" htmlFor="categoryId">Issue category</label><select className={`${field} h-12`} defaultValue={initial?.categoryId ?? ""} id="categoryId" name="categoryId" required><option disabled value="">Select a category</option>{categories.map((category) => <option key={category.id} value={category.id}>{category.name}</option>)}</select>{error("categoryId") && <p className="mt-1 text-xs text-red-700">{error("categoryId")}</p>}</div>
    <div><label className="text-sm font-bold text-brand-dark" htmlFor="title">Short title</label><input className={`${field} h-12`} defaultValue={initial?.title} id="title" maxLength={100} name="title" placeholder="Example: Streetlight not working" required />{error("title") && <p className="mt-1 text-xs text-red-700">{error("title")}</p>}</div>
    <div><label className="text-sm font-bold text-brand-dark" htmlFor="description">Description</label><textarea className={`${field} min-h-36 resize-y p-4`} defaultValue={initial?.description} id="description" maxLength={1000} name="description" placeholder="Describe what happened, when you noticed it, and any immediate risk." /><p className="mt-2 flex items-center gap-1.5 text-xs text-muted"><Info size={14} /> Avoid private or sensitive information.</p>{error("description") && <p className="mt-1 text-xs text-red-700">{error("description")}</p>}</div>
    <div><label className="text-sm font-bold text-brand-dark" htmlFor="address">Location</label><div className="relative mt-2"><MapPin className="absolute left-3 top-3.5 text-muted" size={19} /><input className="h-12 w-full rounded-xl border border-border bg-background pl-10 pr-4 text-sm" defaultValue={initial?.address} id="address" name="address" placeholder="Street, landmark, or area" /></div>{error("address") && <p className="mt-1 text-xs text-red-700">{error("address")}</p>}</div>
    <input defaultValue={initial?.latitude ?? ""} name="latitude" type="hidden" /><input defaultValue={initial?.longitude ?? ""} name="longitude" type="hidden" />
    <div><p className="text-sm font-bold text-brand-dark">Photo evidence <span className="font-normal text-muted">(optional)</span></p><label className="mt-2 flex min-h-36 cursor-pointer flex-col items-center justify-center rounded-2xl border border-dashed border-brand/35 bg-brand-soft/35 p-5 text-center" htmlFor="photo"><Camera className="text-brand" size={25} /><span className="mt-3 text-sm font-bold text-brand-dark">Upload a clear photo</span><span className="mt-1 text-xs text-muted">JPG, PNG, or WebP, up to 10 MB</span><input accept="image/png,image/jpeg,image/webp" className="sr-only" id="photo" name="photo" type="file" /></label></div>
    <Actions />
  </form>;
}
