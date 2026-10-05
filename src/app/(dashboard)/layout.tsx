import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { Sidebar } from "@/components/layout/sidebar";
import { Topbar } from "@/components/layout/topbar";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/login");

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="flex">
        <Sidebar user={session.user} />
        <div className="flex-1 flex flex-col min-w-0 lg:pl-72">
          <Topbar user={session.user} />
          <main className="flex-1 p-4 sm:p-6 lg:p-8 animate-fade-in">{children}</main>
        </div>
      </div>
    </div>
  );
}
