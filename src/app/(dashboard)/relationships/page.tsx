"use client";

import { useState } from "react";
import useSWR from "swr";
import Link from "next/link";
import { Heart, Plus, Trash2, ArrowRight } from "lucide-react";
import { Card, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { TableSkeleton } from "@/components/ui/skeleton";
import { Modal } from "@/components/ui/modal";
import { useToast } from "@/components/ui/toast";
import { fullName, initials } from "@/lib/utils";

const fetcher = (url: string) => fetch(url).then((r) => r.json());

export default function RelationshipsPage() {
  const { toast } = useToast();
  const [addOpen, setAddOpen] = useState(false);

  const { data: rels, error, isLoading, mutate } = useSWR("/api/relationships", fetcher, {
    revalidateOnFocus: false,
  });

  const { data: people } = useSWR("/api/people", fetcher, { revalidateOnFocus: false });

  const relationships: any[] = rels ?? [];

  async function handleDelete(id: string) {
    if (!confirm("Padam hubungan ini?")) return;
    const optimistic = relationships.filter((r) => r.id !== id);
    mutate(optimistic, false);
    try {
      const res = await fetch(`/api/relationships/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error();
      toast("success", "Hubungan telah dipadam");
      mutate();
    } catch {
      mutate(relationships, false);
      toast("error", "Gagal memadam hubungan");
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Hubungan Keluarga</h2>
          <p className="mt-1 text-sm text-slate-500">
            {isLoading ? "Memuatkan..." : `${relationships.length} hubungan dicatatkan`}
          </p>
        </div>
        <Button onClick={() => setAddOpen(true)}>
          <Plus className="w-4 h-4" />
          Tambah Hubungan
        </Button>
      </div>

      {error ? (
        <Card className="p-16">
          <EmptyState icon={Heart} title="Gagal memuatkan" description="Cuba muat semula data." />
        </Card>
      ) : isLoading ? (
        <TableSkeleton rows={5} />
      ) : relationships.length === 0 ? (
        <Card className="p-16">
          <EmptyState
            icon={Heart}
            title="Tiada hubungan"
            description="Tambah hubungan antara ahli keluarga untuk membina salasilah."
            action={
              <Button onClick={() => setAddOpen(true)}>
                <Plus className="w-4 h-4" />
                Tambah Hubungan Pertama
              </Button>
            }
          />
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {relationships.map((r) => (
            <Card key={r.id} className="p-5 group">
              <div className="flex items-center gap-3">
                <PersonChip person={r.from} />
                <div className="flex flex-col items-center gap-0.5 shrink-0">
                  <span className="text-[10px] font-semibold uppercase tracking-wide text-slate-400">
                    {r.type === "PARENT_CHILD" ? "Ibu bapa → Anak" : "Pasangan"}
                  </span>
                  <ArrowRight className="w-4 h-4 text-slate-300" />
                </div>
                <PersonChip person={r.to} />
                <button
                  onClick={() => handleDelete(r.id)}
                  className="ml-auto p-1.5 rounded-lg text-slate-300 hover:text-red-600 hover:bg-red-50 transition opacity-0 group-hover:opacity-100"
                  title="Padam hubungan"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </Card>
          ))}
        </div>
      )}

      <AddRelationshipModal
        open={addOpen}
        onClose={() => setAddOpen(false)}
        people={people ?? []}
        onSaved={() => {
          setAddOpen(false);
          mutate();
        }}
      />
    </div>
  );
}

function PersonChip({ person }: { person: any }) {
  if (!person) return null;
  return (
    <Link href={`/people/${person.id}`} className="flex items-center gap-2.5 min-w-0 hover:opacity-80 transition">
      <div className="w-9 h-9 rounded-full bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center text-white text-xs font-semibold shrink-0">
        {initials(fullName(person))}
      </div>
      <span className="text-sm font-medium text-slate-900 truncate">{fullName(person)}</span>
    </Link>
  );
}

function AddRelationshipModal({
  open,
  onClose,
  people,
  onSaved,
}: {
  open: boolean;
  onClose: () => void;
  people: any[];
  onSaved: () => void;
}) {
  const { toast } = useToast();
  const [type, setType] = useState("PARENT_CHILD");
  const [fromId, setFromId] = useState("");
  const [toId, setToId] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!fromId || !toId) {
      toast("error", "Sila pilih kedua-dua ahli");
      return;
    }
    if (fromId === toId) {
      toast("error", "Tidak boleh menghubungkan diri sendiri");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/relationships", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type, fromId, toId }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Gagal");
      toast("success", "Hubungan ditambah");
      setType("PARENT_CHILD");
      setFromId("");
      setToId("");
      onSaved();
    } catch (err: any) {
      toast("error", err.message ?? "Gagal menambah hubungan");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Tambah Hubungan"
      description="Hubungkan dua ahli keluarga"
    >
      {people.length < 2 ? (
        <EmptyState
          icon={Heart}
          title="Ahli tidak mencukupi"
          description="Tambah sekurang-kurangnya dua ahli keluarga dahulu."
          action={
            <Link href="/people">
              <Button variant="outline">Tambah Ahli</Button>
            </Link>
          }
        />
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">Jenis Hubungan</label>
            <select
              value={type}
              onChange={(e) => setType(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
            >
              <option value="PARENT_CHILD">Ibu bapa → Anak</option>
              <option value="SPOUSE">Pasangan</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">
              {type === "PARENT_CHILD" ? "Ibu Bapa" : "Pasangan 1"}
            </label>
            <select
              value={fromId}
              onChange={(e) => setFromId(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
              required
            >
              <option value="">Pilih ahli...</option>
              {people.map((p) => (
                <option key={p.id} value={p.id}>
                  {fullName(p)}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">
              {type === "PARENT_CHILD" ? "Anak" : "Pasangan 2"}
            </label>
            <select
              value={toId}
              onChange={(e) => setToId(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
              required
            >
              <option value="">Pilih ahli...</option>
              {people.map((p) => (
                <option key={p.id} value={p.id}>
                  {fullName(p)}
                </option>
              ))}
            </select>
          </div>
          <div className="flex items-center justify-end gap-3 pt-2">
            <Button type="button" variant="outline" onClick={onClose} disabled={loading}>
              Batal
            </Button>
            <Button type="submit" loading={loading}>
              Tambah Hubungan
            </Button>
          </div>
        </form>
      )}
    </Modal>
  );
}
