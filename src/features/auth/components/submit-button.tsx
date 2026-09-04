"use client";

import { useFormStatus } from "react-dom";

export function SubmitButton({ children }: Readonly<{ children: React.ReactNode }>) {
  const { pending } = useFormStatus();

  return (
    <button
      className="w-full rounded-full bg-brand px-5 py-3 text-sm font-bold text-white enabled:hover:bg-brand-dark disabled:cursor-wait disabled:opacity-60"
      disabled={pending}
      type="submit"
    >
      {pending ? "Please wait…" : children}
    </button>
  );
}

