import Link from "next/link";
import { BrandMark } from "@/components/ui/brand-mark";
import { getCurrentUser } from "@/lib/auth/user";

export async function SiteHeader() {
  const user = await getCurrentUser();

  return (
    <header className="border-b border-border/80 bg-background/90 backdrop-blur">
      <div className="mx-auto flex h-18 max-w-7xl items-center justify-between px-5 lg:px-8">
        <Link aria-label="Agapay home" href="/">
          <BrandMark />
        </Link>
        <nav aria-label="Main navigation" className="hidden items-center gap-8 text-sm font-medium md:flex">
          <a className="transition hover:text-brand" href="#how-it-works">How it works</a>
          <a className="transition hover:text-brand" href="#features">Features</a>
          <a className="transition hover:text-brand" href="#impact">Impact</a>
        </nav>
        <div className="flex items-center gap-2">
          {user ? (
            <Link className="rounded-full bg-brand px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-brand-dark" href="/post-login">
              Open dashboard
            </Link>
          ) : (
            <>
              <Link className="hidden rounded-full px-4 py-2 text-sm font-semibold text-brand-dark hover:bg-brand-soft sm:block" href="/sign-in">Sign in</Link>
              <Link className="rounded-full bg-brand px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-brand-dark" href="/sign-up">Create account</Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
