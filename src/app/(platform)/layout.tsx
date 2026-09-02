import { PlatformShell } from "@/components/layout/platform-shell";

export default function ResidentLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <PlatformShell>{children}</PlatformShell>;
}

