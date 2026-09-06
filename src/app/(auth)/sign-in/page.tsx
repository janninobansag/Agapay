import Link from "next/link";
import { BrandMark } from "@/components/ui/brand-mark";
import { SignInForm } from "@/features/auth/components/sign-in-form";
import { SocialAuthButtons } from "@/features/auth/components/social-auth-buttons";
import { socialSignInProviders } from "@/auth";

export const metadata = { title: "Sign in" };

export default function SignInPage() {
  return (
    <main className="grid min-h-screen place-items-center px-5 py-12">
      <div className="w-full max-w-md rounded-3xl border border-border bg-surface p-6 shadow-sm sm:p-8">
        <Link aria-label="Agapay home" href="/"><BrandMark /></Link>
        <h1 className="mt-10 text-3xl font-bold tracking-tight text-brand-dark">Welcome back</h1>
        <p className="mt-2 text-sm text-muted">Sign in to track your reports and community updates.</p>
        <SignInForm />
        <SocialAuthButtons providers={socialSignInProviders} />
        <p className="mt-6 text-center text-sm text-muted">New to Agapay? <Link className="font-bold text-brand" href="/sign-up">Create an account</Link></p>
      </div>
    </main>
  );
}
