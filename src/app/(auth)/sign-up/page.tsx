import Link from "next/link";
import { BrandMark } from "@/components/ui/brand-mark";
import { SignUpForm } from "@/features/auth/components/sign-up-form";
import { SocialAuthButtons } from "@/features/auth/components/social-auth-buttons";
import { socialSignInProviders } from "@/auth";

export const metadata = { title: "Create account" };

export default function SignUpPage() {
  return (
    <main className="grid min-h-screen place-items-center px-5 py-12">
      <div className="w-full max-w-md rounded-3xl border border-border bg-surface p-6 shadow-sm sm:p-8">
        <Link aria-label="Agapay home" href="/"><BrandMark /></Link>
        <h1 className="mt-10 text-3xl font-bold tracking-tight text-brand-dark">Join your community</h1>
        <p className="mt-2 text-sm text-muted">Create an account to submit and follow local reports.</p>
        <SocialAuthButtons providers={socialSignInProviders} />
        <SignUpForm />
        <p className="mt-6 text-center text-sm text-muted">Already registered? <Link className="font-bold text-brand" href="/sign-in">Sign in</Link></p>
      </div>
    </main>
  );
}
