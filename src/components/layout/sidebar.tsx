"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Users,
  FileText,
  Network,
  Heart,
  X,
  UsersRound,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useEffect, useState } from "react";

const nav = [
  { href: "/dashboard", label: "Papan Pemuka", icon: LayoutDashboard },
  { href: "/people", label: "Ahli Keluarga", icon: Users },
  { href: "/tree", label: "Salasilah Keluarga", icon: Network },
  { href: "/relationships", label: "Hubungan", icon: Heart },
  { href: "/documents", label: "Dokumen", icon: FileText },
];

export function Sidebar({ user }: { user: any }) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const toggle = () => setOpen((v) => !v);
    window.addEventListener("sidebar-toggle", toggle);
    return () => window.removeEventListener("sidebar-toggle", toggle);
  }, []);

  return (
    <>
      {/* Mobile overlay */}
      {open && (
        <div
          className="fixed inset-0 z-40 bg-slate-900/40 backdrop-blur-sm lg:hidden"
          onClick={() => setOpen(false)}
        />
      )}

      <aside
        className={cn(
          "fixed top-0 left-0 z-50 h-full w-72 bg-white border-r border-slate-200 flex flex-col transition-transform duration-300 lg:translate-x-0",
          open ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="flex items-center justify-between px-5 py-5 border-b border-slate-100">
          <Link href="/dashboard" className="flex items-center gap-3" onClick={() => setOpen(false)}>
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center shadow-md shadow-emerald-200">
              <UsersRound className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="font-bold text-slate-900 leading-tight">Silsilah Keluarga</h1>
              <p className="text-[11px] text-slate-400">untuk semua umur</p>
            </div>
          </Link>
          <button
            onClick={() => setOpen(false)}
            className="lg:hidden p-1.5 rounded-lg hover:bg-slate-100 text-slate-500"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto scrollbar-thin">
          {nav.map((item) => {
            const active = pathname === item.href || pathname.startsWith(item.href + "/");
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setOpen(false)}
                className={cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition group",
                  active
                    ? "bg-emerald-50 text-emerald-700"
                    : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                )}
              >
                <Icon
                  className={cn(
                    "w-5 h-5 transition",
                    active ? "text-emerald-600" : "text-slate-400 group-hover:text-slate-600"
                  )}
                />
                {item.label}
                {active && <span className="ml-auto w-1.5 h-1.5 rounded-full bg-emerald-500" />}
              </Link>
            );
          })}
        </nav>

        <div className="px-3 py-4 border-t border-slate-100">
          <div className="flex items-center gap-3 px-3 py-2 rounded-lg bg-slate-50">
            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center text-white text-sm font-semibold shrink-0">
              {(user?.name ?? "U").charAt(0).toUpperCase()}
            </div>
            <div className="min-w-0">
              <p className="text-sm font-medium text-slate-900 truncate">{user?.name}</p>
              <p className="text-xs text-slate-400 truncate">{user?.email}</p>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}
