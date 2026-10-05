"use client";

import { signOut } from "next-auth/react";
import { LogOut, Menu } from "lucide-react";
import { usePathname } from "next/navigation";

const titles: Record<string, string> = {
  "/dashboard": "Papan Pemuka",
  "/people": "Ahli Keluarga",
  "/tree": "Salasilah Keluarga",
  "/relationships": "Hubungan Keluarga",
  "/documents": "Dokumen",
};

export function Topbar({ user }: { user: any }) {
  const pathname = usePathname();
  const title = titles[pathname] ?? "Silsilah Keluarga";

  return (
    <header className="sticky top-0 z-30 bg-white/80 backdrop-blur-md border-b border-slate-200">
      <div className="flex items-center justify-between px-4 sm:px-6 lg:px-8 h-16">
        <div className="flex items-center gap-3">
          <button
            onClick={() => window.dispatchEvent(new Event("sidebar-toggle"))}
            className="lg:hidden p-2 rounded-lg hover:bg-slate-100 text-slate-600"
          >
            <Menu className="w-5 h-5" />
          </button>
          <div>
            <h2 className="text-lg font-bold text-slate-900">{title}</h2>
            <p className="hidden sm:block text-xs text-slate-400">Selamat datang kembali, {user?.name?.split(" ")[0]}</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => signOut({ callbackUrl: "/login" })}
            className="flex items-center gap-2 text-sm font-medium text-slate-600 hover:text-red-600 px-3 py-2 rounded-lg hover:bg-red-50 transition"
          >
            <LogOut className="w-4 h-4" />
            <span className="hidden sm:inline">Keluar</span>
          </button>
        </div>
      </div>
    </header>
  );
}
