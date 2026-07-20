import { Sidebar } from "@/components/layout/Sidebar";
import { Topbar } from "@/components/layout/Topbar";
import { CommandPalette } from "@/components/layout/CommandPalette";
import { auth } from "@/lib/auth/auth";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();
  const isAdmin = (session?.user as any)?.role === "ADMIN" || (session?.user as any)?.role === "SUPER_ADMIN";

  return (
    <div className="flex min-h-screen bg-bg">
      <Sidebar isAdmin={isAdmin} />
      <div className="flex-1">
        <Topbar userName={session?.user?.name} plan={(session?.user as any)?.plan} />
        <main className="overflow-y-auto">{children}</main>
      </div>
      <CommandPalette />
    </div>
  );
}
