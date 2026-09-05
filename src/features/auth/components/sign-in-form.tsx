"use client";

import { useActionState } from "react";
import { authenticate, type AuthFormState } from "@/server/actions/auth";
import { SubmitButton } from "./submit-button";

const initialState: AuthFormState = {};

export function SignInForm() {
  const [state, formAction] = useActionState(authenticate, initialState);

  return (
    <form action={formAction} className="mt-8 space-y-5">
      <div>
        <label className="text-sm font-bold" htmlFor="email">Email address</label>
        <input autoComplete="email" className="mt-2 h-12 w-full rounded-xl border border-border bg-background px-4 text-sm" id="email" name="email" placeholder="you@example.com" required type="email" />
        {state.errors?.email?.map((error) => <p className="mt-1 text-xs text-rose-700" key={error}>{error}</p>)}
      </div>
      <div>
        <div className="flex justify-between"><label className="text-sm font-bold" htmlFor="password">Password</label><span className="text-xs text-muted">Minimum 8 characters</span></div>
        <input autoComplete="current-password" className="mt-2 h-12 w-full rounded-xl border border-border bg-background px-4 text-sm" id="password" name="password" required type="password" />
        {state.errors?.password?.map((error) => <p className="mt-1 text-xs text-rose-700" key={error}>{error}</p>)}
      </div>
      <label className="flex cursor-pointer items-start gap-3 rounded-xl bg-surface-muted/70 p-3 text-sm text-muted">
        <input className="mt-0.5 size-4 accent-brand" id="remember-me" name="rememberMe" type="checkbox" />
        <span><span className="font-bold text-brand-dark">Remember me</span><span className="mt-0.5 block text-xs leading-5">Keep this device signed in for 30 days. Do not use this on a shared device.</span></span>
      </label>
      {state.message && <p className="rounded-xl bg-rose-50 p-3 text-sm font-medium text-rose-800" role="alert">{state.message}</p>}
      <SubmitButton>Sign in</SubmitButton>
    </form>
  );
}
