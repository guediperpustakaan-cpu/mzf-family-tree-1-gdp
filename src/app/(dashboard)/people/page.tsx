"use client";

import { useMemo, useState } from "react";
import useSWR from "swr";
import Link from "next/link";
import {
  Users,
  Search,
  Plus,
  Pencil,
  Trash2,
  Filter,
  Heart,
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { TableSkeleton } from "@/components/ui/skeleton";
import { calculateAge, formatDate, fullName, initials } from "@/lib/utils";
import { useToast } from "@/components/ui/toast";
import { PersonFormModal } from "@/components/people/person-form-modal";

const fetcher = (url: string) => fetch(url).then((r) => r.json());

export default function PeoplePage() {
  const { toast } = useToast();
  const [q, setQ] = useState("");
  const [gender, setGender] = useState("");
  const [status, setStatus] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<any | null>(null);
  const [deleting, setDeleting] = useState<string | null>(null);

  const query = useMemo(() => {
    const p = new URLSearchParams();
    if (q.trim()) p.set("q", q.trim());
    if (gender) p.set("gender", gender);
    if (status) p.set("status", status);
    return p.toString();
  }, [q, gender, status]);

  const { data, error, isLoading, mutate } = useSWR(`/api/people?${query}`, fetcher, {
    revalidateOnFocus: false,
    keepPreviousData: true,
  });

  const people: any[] = data ?? [];

  async function handleDelete(id: string, name: string) {
    if (!confirm(`Padam ${name}? Tindakan ini akan membuang semua rekod berkaitan.`)) return;
    setDeleting(id);
    const optimistic = people.filter((p) => p.id !== id);
    mutate(optimistic, false);
    try {
      const res = await fetch(`/api/people/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error();
      toast("success", `${name} telah dipadam`);
      mutate();
    } catch {
      mutate(people, false);
      toast("error", `Gagal memadam ${name}`);
    } finally {
      setDeleting(null);
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Ahli Keluarga</h2>
          <p className="mt-1 text-sm text-slate-500">
            {isLoading ? "Memuatkan..." : `${people.length} ahli keluarga didaftarkan`}
          </p>
        </div>
        <Button
          onClick={() => {
            setEditing(null);
            setFormOpen(true);
          }}
        >
          <Plus className="w-4 h-4" />
          Tambah Ahli
        </Button>
      </div>

      <Card className="p-4">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Cari nama, pekerjaan, tempat lahir..."
              className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition text-sm"
            />
          </div>
          <Button variant="outline" onClick={() => setShowFilters((v) => !v)} className={showFilters ? "ring-2 ring-emerald-500/20" : ""}>
            <Filter className="w-4 h-4" />
            Penapis
            {(gender || status) && <span className="w-2 h-2 rounded-full bg-emerald-500" />}
          </Button>
        </div>

        {showFilters && (
          <div className="mt-4 flex flex-wrap gap-3 animate-fade-in">
            <select
              value={gender}
              onChange={(e) => setGender(e.target.value)}
              className="px-3 py-2 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
            >
              <option value="">Semua jantina</option>
              <option value="MALE">Lelaki</option>
              <option value="FEMALE">Perempuan</option>
            </select>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="px-3 py-2 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
            >
              <option value="">Semua status</option>
              <option value="ALIVE">Hidup</option>
              <option value="DECEASED">Meninggal dunia</option>
            </select>
            {(gender || status) && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setGender("");
                  setStatus("");
                }}
              >
                Kosongkan
              </Button>
            )}
          </div>
        )}
      </Card>

      {error ? (
        <Card className="p-16">
          <EmptyState
            icon={Users}
            title="Gagal memuatkan"
            description="Terdapat ralat semasa memuatkan data. Cuba lagi."
            action={
              <Button variant="outline" onClick={() => mutate()}>
                Cuba lagi
              </Button>
            }
          />
        </Card>
      ) : isLoading ? (
        <TableSkeleton rows={6} />
      ) : people.length === 0 ? (
        <Card className="p-16">
          <EmptyState
            icon={Users}
            title={q || gender || status ? "Tiada hasil carian" : "Belum ada ahli keluarga"}
            description={
              q || gender || status
                ? "Cuba ubah kata kunci atau penapis carian anda."
                : "Mulakan salasilah keluarga anda dengan menambah ahli pertama."
            }
            action={
              q || gender || status ? (
                <Button
                  variant="outline"
                  onClick={() => {
                    setQ("");
                    setGender("");
                    setStatus("");
                  }}
                >
                  Kosongkan penapis
                </Button>
              ) : (
                <Button
                  onClick={() => {
                    setEditing(null);
                    setFormOpen(true);
                  }}
                >
                  <Plus className="w-4 h-4" />
                  Tambah Ahli Pertama
                </Button>
              )
            }
          />
        </Card>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {people.map((p) => {
            const age = calculateAge(p.birthDate, p.deathDate);
            const name = fullName(p);
            const isDeleting = deleting === p.id;
            return (
              <Card
                key={p.id}
                className={`p-5 group transition-all hover:shadow-md hover:-translate-y-0.5 ${
                  isDeleting ? "opacity-50 scale-95" : ""
                }`}
              >
                <div className="flex items-start gap-4">
                  <Link href={`/people/${p.id}`} className="shrink-0">
                    <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center text-white text-lg font-bold ring-2 ring-white shadow-sm">
                      {initials(name)}
                    </div>
                  </Link>
                  <div className="min-w-0 flex-1">
                    <Link href={`/people/${p.id}`}>
                      <h3 className="font-semibold text-slate-900 hover:text-emerald-600 transition truncate">
                        {name}
                      </h3>
                    </Link>
                    <p className="mt-0.5 text-xs text-slate-500 truncate">
                      {p.occupation || "Pekerjaan tidak diisi"}
                    </p>
                    <div className="mt-2 flex flex-wrap items-center gap-1.5">
                      <span
                        className={`text-[11px] font-medium px-2 py-0.5 rounded-md ${
                          p.gender === "MALE"
                            ? "text-blue-700 bg-blue-50"
                            : "text-pink-700 bg-pink-50"
                        }`}
                      >
                        {p.gender === "MALE" ? "Lelaki" : "Perempuan"}
                      </span>
                      <span
                        className={`text-[11px] font-medium px-2 py-0.5 rounded-md ${
                          p.status === "DECEASED"
                            ? "text-slate-600 bg-slate-100"
                            : "text-emerald-700 bg-emerald-50"
                        }`}
                      >
                        {p.status === "DECEASED" ? (
                          "Meninggal"
                        ) : age !== null ? (
                          `${age} tahun`
                        ) : (
                          <span className="inline-flex items-center gap-1">
                            <Heart className="w-3 h-3" /> Hidup
                          </span>
                        )}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="mt-4 pt-4 border-t border-slate-100 flex items-center justify-between">
                  <p className="text-xs text-slate-400">
                    {p.birthDate ? `Lahir ${formatDate(p.birthDate, { day: "numeric", month: "short", year: "numeric" })}` : "Tarikh lahir tidak diisi"}
                  </p>
                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition">
                    <button
                      onClick={() => {
                        setEditing(p);
                        setFormOpen(true);
                      }}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 transition"
                      title="Edit"
                    >
                      <Pencil className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(p.id, name)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 transition"
                      title="Padam"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}

      <PersonFormModal
        open={formOpen}
        onClose={() => setFormOpen(false)}
        person={editing}
        onSaved={() => {
          setFormOpen(false);
          mutate();
        }}
      />
    </div>
  );
}
