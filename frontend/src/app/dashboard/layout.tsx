import { DashboardShell } from "@/components/DashboardShell";

const DEFAULT_INACTIVITY_TIMEOUT_MS = 15_000;

export const dynamic = "force-dynamic";

function getInactivityTimeoutMs(): number {
  const configuredTimeout = Number(process.env.SESSION_INACTIVITY_TIMEOUT_MS);
  return Number.isFinite(configuredTimeout) && configuredTimeout > 0
    ? configuredTimeout
    : DEFAULT_INACTIVITY_TIMEOUT_MS;
}

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <DashboardShell inactivityTimeoutMs={getInactivityTimeoutMs()}>
      {children}
    </DashboardShell>
  );
}
