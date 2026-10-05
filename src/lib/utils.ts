import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function calculateAge(birth: Date | string | null, death?: Date | string | null): number | null {
  if (!birth) return null;
  const b = new Date(birth);
  const end = death ? new Date(death) : new Date();
  if (isNaN(b.getTime())) return null;
  let age = end.getFullYear() - b.getFullYear();
  const monthDiff = end.getMonth() - b.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && end.getDate() < b.getDate())) {
    age--;
  }
  return age >= 0 ? age : null;
}

export function fullName(p: { firstName: string; lastName?: string | null }): string {
  return [p.firstName, p.lastName].filter(Boolean).join(" ");
}

export function formatDate(d: Date | string | null, opts?: Intl.DateTimeFormatOptions): string {
  if (!d) return "—";
  const date = new Date(d);
  if (isNaN(date.getTime())) return "—";
  return date.toLocaleDateString("ms-MY", opts ?? { day: "numeric", month: "long", year: "numeric" });
}

export function initials(name: string): string {
  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase() ?? "")
    .join("");
}
