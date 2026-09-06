"use client";

import { signIn } from "next-auth/react";

type SocialAuthButtonsProps = {
  providers: {
    google: boolean;
    facebook: boolean;
  };
};

function GoogleIcon() {
  return (
    <svg aria-hidden="true" className="size-5" viewBox="0 0 24 24">
      <path d="M21.35 12.27c0-.79-.07-1.54-.2-2.27H12v4.3h5.23a4.47 4.47 0 0 1-1.94 2.93v2.79h3.59c2.1-1.93 3.32-4.78 3.32-7.75Z" fill="#4285F4" />
      <path d="M12 21.75c2.7 0 4.97-.9 6.63-2.43l-3.59-2.79c-.9.6-2.05.96-3.4.96-2.61 0-4.82-1.76-5.61-4.13H2.32v2.88A9.99 9.99 0 0 0 12 21.75Z" fill="#34A853" />
      <path d="M6.39 13.36A5.99 5.99 0 0 1 6.08 12c0-.47.08-.93.25-1.36V7.76H2.32A9.99 9.99 0 0 0 2 12c0 1.61.39 3.14 1.08 4.49l3.31-3.13Z" fill="#FBBC05" />
      <path d="M12 6.51c1.47 0 2.79.51 3.83 1.51l2.87-2.87C16.96 3.54 14.7 2.5 12 2.5a9.99 9.99 0 0 0-9.68 6.51l4.07 3.13C7.18 8.27 9.39 6.51 12 6.51Z" fill="#EA4335" />
    </svg>
  );
}

function FacebookIcon() {
  return (
    <svg aria-hidden="true" className="size-5" viewBox="0 0 24 24">
      <circle cx="12" cy="12" fill="#1877F2" r="12" />
      <path d="M15.13 13.1 15.5 10.7h-2.31V9.14c0-.66.32-1.3 1.36-1.3h1.05V5.8s-.95-.16-1.86-.16c-1.9 0-3.14 1.15-3.14 3.24v1.82H8.48v2.4h2.12v5.8a8.99 8.99 0 0 0 2.59 0v-5.8h1.94Z" fill="#fff" />
    </svg>
  );
}

export function SocialAuthButtons({ providers }: SocialAuthButtonsProps) {
  const options = [
    providers.google ? { id: "google", label: "Continue with Google", Icon: GoogleIcon } : null,
    providers.facebook ? { id: "facebook", label: "Continue with Facebook", Icon: FacebookIcon } : null,
  ].filter((provider): provider is NonNullable<typeof provider> => provider !== null);

  if (!options.length) return null;

  return (
    <div className="mt-8 space-y-3">
      <div className="flex items-center gap-3 text-xs font-medium text-muted before:h-px before:flex-1 before:bg-border after:h-px after:flex-1 after:bg-border">or continue with</div>
      {options.map((provider) => (
        <button className="flex h-12 w-full items-center justify-center gap-3 rounded-xl border border-border bg-surface text-sm font-bold text-brand-dark transition hover:border-brand/35 hover:bg-brand-soft/50" key={provider.id} onClick={() => signIn(provider.id, { redirectTo: "/post-login" })} type="button">
          <provider.Icon />
          {provider.label}
        </button>
      ))}
    </div>
  );
}
