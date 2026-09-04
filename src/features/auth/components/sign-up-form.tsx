"use client";

import { useActionState } from "react";
import { registerResident, type AuthFormState } from "@/server/actions/auth";
import { SubmitButton } from "./submit-button";

const initialState: AuthFormState = {};

function FieldErrors({ errors }: { errors?: string[] }) {
  return errors?.map((error) => <p className="mt-1 text-xs text-rose-700" key={error}>{error}</p>);
}

export function SignUpForm() {
  const [state, formAction] = useActionState(registerResident, initialState);

  return (
    <form action={formAction} className="mt-8 space-y-5">
      <div><label className="text-sm font-bold" htmlFor="name">Full name</label><input autoComplete="name" className="mt-2 h-12 w-full rounded-xl border border-border bg-background px-4 text-sm" id="name" name="name" required /><FieldErrors errors={state.errors?.name} /></div>
      <div><label className="text-sm font-bold" htmlFor="email">Email address</label><input autoComplete="email" className="mt-2 h-12 w-full rounded-xl border border-border bg-background px-4 text-sm" id="email" name="email" required type="email" /><FieldErrors errors={state.errors?.email} /></div>
      <div><label className="text-sm font-bold" htmlFor="password">Password</label><input autoComplete="new-password" className="mt-2 h-12 w-full rounded-xl border border-border bg-background px-4 text-sm" id="password" minLength={12} name="password" required type="password" /><FieldErrors errors={state.errors?.password} /><p className="mt-1 text-xs text-muted">Use 12+ characters with uppercase, lowercase, and a number.</p></div>
      <div><label className="text-sm font-bold" htmlFor="confirmPassword">Confirm password</label><input autoComplete="new-password" className="mt-2 h-12 w-full rounded-xl border border-border bg-background px-4 text-sm" id="confirmPassword" minLength={12} name="confirmPassword" required type="password" /><FieldErrors errors={state.errors?.confirmPassword} /></div>
      {state.message && <p className="rounded-xl bg-rose-50 p-3 text-sm font-medium text-rose-800" role="alert">{state.message}</p>}
      <SubmitButton>Create account</SubmitButton>
    </form>
  );
}

