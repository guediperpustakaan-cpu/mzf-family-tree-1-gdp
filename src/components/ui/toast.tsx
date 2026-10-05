"use client";

import { createContext, useCallback, useContext, useState } from "react";
import { CheckCircle2, XCircle, Info, Loader2, X } from "lucide-react";
import { cn } from "@/lib/utils";

type ToastType = "success" | "error" | "info" | "loading";

interface Toast {
  id: string;
  type: ToastType;
  message: string;
}

interface ToastContextValue {
  toast: (type: ToastType, message: string) => string;
  dismiss: (id: string) => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast mesti digunakan dalam ToastProvider");
  return ctx;
}

const icons: Record<ToastType, React.ElementType> = {
  success: CheckCircle2,
  error: XCircle,
  info: Info,
  loading: Loader2,
};

const styles: Record<ToastType, string> = {
  success: "text-emerald-600 bg-emerald-50 border-emerald-100",
  error: "text-red-600 bg-red-50 border-red-100",
  info: "text-blue-600 bg-blue-50 border-blue-100",
  loading: "text-slate-600 bg-slate-50 border-slate-100",
};

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const dismiss = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const toast = useCallback(
    (type: ToastType, message: string) => {
      const id = Math.random().toString(36).slice(2);
      setToasts((prev) => [...prev, { id, type, message }]);
      if (type !== "loading") {
        setTimeout(() => dismiss(id), 4000);
      }
      return id;
    },
    [dismiss]
  );

  return (
    <ToastContext.Provider value={{ toast, dismiss }}>
      {children}
      <div className="fixed bottom-4 right-4 z-[100] flex flex-col gap-2 w-full max-w-sm px-4 sm:px-0">
        {toasts.map((t) => {
          const Icon = icons[t.type];
          return (
            <div
              key={t.id}
              className={cn(
                "flex items-center gap-3 px-4 py-3 rounded-xl border bg-white shadow-lg shadow-slate-200/60 animate-fade-in",
                styles[t.type]
              )}
            >
              <Icon className={cn("w-5 h-5 shrink-0", t.type === "loading" && "animate-spin")} />
              <p className="flex-1 text-sm font-medium text-slate-700">{t.message}</p>
              {t.type !== "loading" && (
                <button onClick={() => dismiss(t.id)} className="text-slate-400 hover:text-slate-700">
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
}
