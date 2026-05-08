import Link from "next/link";
import { redirect } from "next/navigation";
import { CheckSquare2 } from "lucide-react";
import { getCurrentUser } from "@/lib/auth/current-user";
import { SidebarNav } from "@/components/features/layout/sidebar-nav";
import { UserMenu } from "@/components/features/layout/user-menu";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  return (
    <div className="grid min-h-screen w-full md:grid-cols-[240px_1fr]">
      <aside className="hidden md:flex flex-col border-r bg-sidebar text-sidebar-foreground">
        <Link href="/projects" className="flex items-center gap-2 px-5 py-4 border-b">
          <CheckSquare2 className="size-5 text-primary" />
          <span className="font-semibold">Team Tasks</span>
        </Link>
        <SidebarNav />
      </aside>
      <div className="flex flex-col min-w-0">
        <header className="sticky top-0 z-20 flex h-14 items-center gap-3 border-b bg-background/80 px-4 backdrop-blur">
          <Link href="/projects" className="md:hidden flex items-center gap-2 font-semibold">
            <CheckSquare2 className="size-5 text-primary" />
            Team Tasks
          </Link>
          <div className="flex-1" />
          <UserMenu name={user.name} email={user.email} />
        </header>
        <main className="flex-1 p-4 md:p-8 max-w-screen-2xl w-full">{children}</main>
      </div>
    </div>
  );
}
