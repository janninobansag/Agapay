import Link from "next/link";
import { BrandMark } from "@/components/ui/brand-mark";

export const metadata = { title: "Sign in" };

export default function SignInPage() {
  return (
    <main className="grid min-h-screen place-items-center px-5 py-12">
      <div className="w-full max-w-md rounded-3xl border border-border bg-surface p-6 shadow-sm sm:p-8">
        <Link aria-label="Agapay home" href="/"><BrandMark /></Link>
        <h1 className="mt-10 text-3xl font-bold tracking-tight text-brand-dark">Welcome back</h1>
        <p className="mt-2 text-sm text-muted">Sign in to track your reports and community updates.</p>
        <form className="mt-8 space-y-5">
          <div><label className="text-sm font-bold" htmlFor="email">Email address</label><input autoComplete="email" className="mt-2 h-12 w-full rounded-xl border border-border bg-background px-4 text-sm" id="email" name="email" placeholder="you@example.com" required type="email" /></div>
          <div><div className="flex justify-between"><label className="text-sm font-bold" htmlFor="password">Password</label><button className="text-xs font-bold text-brand" type="button">Forgot password?</button></div><input autoComplete="current-password" className="mt-2 h-12 w-full rounded-xl border border-border bg-background px-4 text-sm" id="password" name="password" required type="password" /></div>
          <button className="w-full rounded-full bg-brand px-5 py-3 text-sm font-bold text-white hover:bg-brand-dark" type="submit">Sign in</button>
        </form>
        <p className="mt-6 text-center text-sm text-muted">New to Agapay? <Link className="font-bold text-brand" href="/sign-up">Create an account</Link></p>
        <p className="mt-5 text-center text-xs text-muted">Authentication will be enabled in the next backend milestone.</p>
      </div>
    </main>
  );
}

