import Link from "next/link";
import { BrandMark } from "@/components/ui/brand-mark";

export const metadata = { title: "Create account" };

export default function SignUpPage() {
  return (
    <main className="grid min-h-screen place-items-center px-5 py-12">
      <div className="w-full max-w-md rounded-3xl border border-border bg-surface p-6 shadow-sm sm:p-8">
        <Link aria-label="Agapay home" href="/"><BrandMark /></Link>
        <h1 className="mt-10 text-3xl font-bold tracking-tight text-brand-dark">Join your community</h1>
        <p className="mt-2 text-sm text-muted">Create an account to submit and follow local reports.</p>
        <form className="mt-8 space-y-5">
          <div><label className="text-sm font-bold" htmlFor="name">Full name</label><input autoComplete="name" className="mt-2 h-12 w-full rounded-xl border border-border bg-background px-4 text-sm" id="name" name="name" required /></div>
          <div><label className="text-sm font-bold" htmlFor="email">Email address</label><input autoComplete="email" className="mt-2 h-12 w-full rounded-xl border border-border bg-background px-4 text-sm" id="email" name="email" required type="email" /></div>
          <div><label className="text-sm font-bold" htmlFor="password">Password</label><input autoComplete="new-password" className="mt-2 h-12 w-full rounded-xl border border-border bg-background px-4 text-sm" id="password" minLength={8} name="password" required type="password" /></div>
          <button className="w-full rounded-full bg-brand px-5 py-3 text-sm font-bold text-white hover:bg-brand-dark" type="submit">Create account</button>
        </form>
        <p className="mt-6 text-center text-sm text-muted">Already registered? <Link className="font-bold text-brand" href="/sign-in">Sign in</Link></p>
      </div>
    </main>
  );
}

