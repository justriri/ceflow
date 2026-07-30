import type { Metadata } from "next";
import { DashboardNav } from "@/components/dashboard-nav";
import { YieldDashboard } from "@/components/yield-dashboard";

export const metadata: Metadata = {
  title: "Dashboard",
};

export default function AppPage() {
  return (
    <div className="flex flex-1 flex-col">
      <DashboardNav />
      <main className="mx-auto flex w-full max-w-6xl flex-1 flex-col px-6 py-8 sm:px-8">
        <YieldDashboard />
      </main>
    </div>
  );
}
