"use client";

import { useMemo, useState } from "react";
import useSWR from "swr";
import Link from "next/link";
import {
  FileText,
  Search,
  Plus,
  Pencil,
  Trash2,
  Filter,
  ExternalLink,
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { TableSkeleton } from "@/components/ui/skeleton";
import { Modal } from "@/components/ui/modal";
import { useToast } from "@/components/ui/toast";
import { formatDate, fullName } from "@/lib/utils";

const fetcher = (url: string) => fetch(url).then((r) => r.json());

const DOC_TYPES = [
  { value: "BIRTH_CERTIFICATE", label: "Sijil Kelahiran", color: "from-emerald-500 to-teal-600", text: "text-emerald-700 bg-emerald-50" },
  { value: "MARRIAGE_CERTIFICATE", label: "Sijil Kahwin", color: "from-rose-500 to-pink-600", text: "text-rose-700 bg-rose-50" },
  { value: "DEATH_CERTIFICATE", label: "Sijil Kematian", color: "from-slate-500 to-slate-700", text: "text-slate-700 bg-slate-100" },
  { value: "IDENTITY_CARD", label: "Kad Pengenalan", color: "from-blue-500 to-indigo-600", text: "text-blue-700 bg-blue-50" },
  { value: "PHOTO", label: "Gambar", color: "from-purple-500 to-fuchsia-600", text: "text-purple-700 bg-purple-50" },
  { value: "LETTER", label: "Surat", color: "from-amber-500 to-orange-600", text: "text-amber-700 bg-amber-50" },
  { value: "OTHER", label: "Lain-lain", color: "from-cyan-500 to-blue-600", text: "text-cyan-700 bg-cyan-50" },
];

function typeMeta(v: string) {
  return DOC_TYPES.find((t) => t.value === v) ?? DOC_TYPES[6];
}

export default function DocumentsPage() {
  const { toast } = useToast();
  const [q, setQ] = useState("");
  const [type, setType] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<any | null>(null);

  const query = useMemo(() => {
    const p = new URLSearchParams();
    if (q.trim()) p.set("q", q.trim());
    if (type) p.set("type", type);
    return p.toString();
  }, [q, type]);

  const { data, error, isLoading, mutate } = useSWR(`/api/documents?${query}`, fetcher, {
    revalidateOnFocus: false,
    keepPreviousData: true,
  });

  const docs: any[] = data ?? [];

  async function handleDelete(id: string, title: string) {
    if (!confirm(`Padam "${title}"?`)) return;
    const optimistic = docs.filter((d) => d.id !== id);
    mutate(optimistic, false);
    try {
      const res = await fetch(`/api/documents/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error();
      toast("success", `"${title}" telah dipadam`);
      mutate();
    } catch {
      mutate(docs, false);
      toast("error", "Gagal memadam dokumen");
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Dokumen Keluarga</h2>
          <p className="mt-1 text-sm text-slate-500">
            {isLoading ? "Memuatkan..." : `${docs.length} dokumen disimpan`}
          </p>
        </div>
        <Button
          onClick={() => {
            setEditing(null);
            setFormOpen(true);
          }}
        >
          <Plus className="w-4 h-4" />
          Tambah Dokumen
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
              placeholder="Cari dokumen..."
              className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition text-sm"
            />
          </div>
          <Button variant="outline" onClick={() => setShowFilters((v) => !v)}>
            <Filter className="w-4 h-4" />
            Penapis
            {type && <span className="w-2 h-2 rounded-full bg-emerald-500" />}
          </Button>
        </div>

        {showFilters && (
          <div className="mt-4 flex flex-wrap gap-3 animate-fade-in">
            <select
              value={type}
              onChange={(e) => setType(e.target.value)}
              className="px-3 py-2 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
            >
              <option value="">Semua jenis</option>
              {DOC_TYPES.map((t) => (
                <option key={t.value} value={t.value}>
                  {t.label}
                </option>
              ))}
            </select>
            {type && (
              <Button variant="ghost" size="sm" onClick={() => setType("")}>
                Kosongkan
              </Button>
            )}
          </div>
        )}
      </Card>

      {error ? (
        <Card className="p-16">
          <EmptyState
            icon={FileText}
            title="Gagal memuatkan"
            description="Terdapat ralat. Cuba lagi."
            action={<Button variant="outline" onClick={() => mutate()}>Cuba lagi</Button>}
          />
        </Card>
      ) : isLoading ? (
        <TableSkeleton rows={5} />
      ) : docs.length === 0 ? (
        <Card className="p-16">
          <EmptyState
            icon={FileText}
            title={q || type ? "Tiada hasil carian" : "Belum ada dokumen"}
            description={
              q || type
                ? "Cuba ubah kata kunci atau jenis dokumen."
                : "Simpan sijil kelahiran, kahwin, dan dokumen penting keluarga."
            }
            action={
              q || type ? (
                <Button
                  variant="outline"
                  onClick={() => {
                    setQ("");
                    setType("");
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
                  Tambah Dokumen Pertama
                </Button>
              )
            }
          />
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {docs.map((d) => {
            const meta = typeMeta(d.type);
            return (
              <Card key={d.id} className="p-5 group hover:shadow-md transition-all hover:-translate-y-0.5">
                <div className="flex items-start gap-4">
                  <div
                    className={`w-12 h-12 rounded-xl bg-gradient-to-br ${meta.color} flex items-center justify-center shrink-0 shadow-sm`}
                  >
                    <FileText className="w-5 h-5 text-white" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <h3 className="font-semibold text-slate-900 leading-snug line-clamp-2">{d.title}</h3>
                    <span className={`mt-2 inline-block text-[11px] font-medium px-2 py-0.5 rounded-md ${meta.text}`}>
                      {meta.label}
                    </span>
                  </div>
                </div>

                <div className="mt-4 space-y-1.5 text-xs text-slate-500">
                  {d.person && (
                    <Link
                      href={`/people/${d.person.id}`}
                      className="flex items-center gap-1.5 hover:text-emerald-600 transition"
                    >
                      <span className="font-medium">Ahli:</span>
                      <span className="truncate">{fullName(d.person)}</span>
                    </Link>
                  )}
                  {d.documentId && (
                    <p className="flex items-center gap-1.5">
                      <span className="font-medium">No. Rujukan:</span>
                      <span className="truncate">{d.documentId}</span>
                    </p>
                  )}
                  <p className="flex items-center gap-1.5">
                    <span className="font-medium">Dikeluarkan:</span>
                    {d.issuedDate ? formatDate(d.issuedDate, { day: "numeric", month: "short", year: "numeric" }) : "—"}
                  </p>
                  {d.issuedBy && (
                    <p className="flex items-center gap-1.5">
                      <span className="font-medium">Oleh:</span>
                      <span className="truncate">{d.issuedBy}</span>
                    </p>
                  )}
                </div>

                {d.notes && (
                  <p className="mt-3 text-xs text-slate-500 bg-slate-50 rounded-lg px-3 py-2 line-clamp-2 border border-slate-100">
                    {d.notes}
                  </p>
                )}

                <div className="mt-4 pt-4 border-t border-slate-100 flex items-center gap-2">
                  {d.fileUrl ? (
                    <a
                      href={d.fileUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 text-xs font-medium text-emerald-600 hover:text-emerald-700"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                      Lihat fail
                    </a>
                  ) : (
                    <span className="text-xs text-slate-300">Tiada fail</span>
                  )}
                  <div className="ml-auto flex items-center gap-1 opacity-0 group-hover:opacity-100 transition">
                    <button
                      onClick={() => {
                        setEditing(d);
                        setFormOpen(true);
                      }}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 transition"
                      title="Edit"
                    >
                      <Pencil className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(d.id, d.title)}
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

      <DocumentFormModal
        open={formOpen}
        onClose={() => setFormOpen(false)}
        document={editing}
        onSaved={() => {
          setFormOpen(false);
          mutate();
        }}
      />
    </div>
  );
}

function DocumentFormModal({
  open,
  onClose,
  document,
  onSaved,
}: {
  open: boolean;
  onClose: () => void;
  document?: any | null;
  onSaved: () => void;
}) {
  const { toast } = useToast();
  const { data: people } = useSWR("/api/people", fetcher, { revalidateOnFocus: false });
  const [form, setForm] = useState({
    title: "",
    type: "BIRTH_CERTIFICATE",
    personId: "",
    issuedDate: "",
    issuedBy: "",
    documentId: "",
    notes: "",
    fileUrl: "",
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Sync form when modal opens
  useMemo(() => {
    if (open) {
      setErrors({});
      setForm({
        title: document?.title ?? "",
        type: document?.type ?? "BIRTH_CERTIFICATE",
        personId: document?.personId ?? "",
        issuedDate: document?.issuedDate ? document.issuedDate.slice(0, 10) : "",
        issuedBy: document?.issuedBy ?? "",
        documentId: document?.documentId ?? "",
        notes: document?.notes ?? "",
        fileUrl: document?.fileUrl ?? "",
      });
    }
  }, [open, document]);

  function set(key: string, value: string) {
    setForm((f) => ({ ...f, [key]: value }));
    setErrors((e) => ({ ...e, [key]: "" }));
  }

  function inputCls(error?: string) {
    return `w-full px-3 py-2 rounded-lg border text-sm transition focus:outline-none focus:ring-2 ${
      error ? "border-red-300 focus:ring-red-500/20" : "border-slate-200 focus:ring-emerald-500/20 focus:border-emerald-500"
    }`;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const errs: Record<string, string> = {};
    if (!form.title.trim()) errs.title = "Tajuk diperlukan";
    if (form.fileUrl && !/^https?:\/\//.test(form.fileUrl)) errs.fileUrl = "URL tidak sah (mesti bermula dengan http)";
    setErrors(errs);
    if (Object.keys(errs).length) return;

    setLoading(true);
    const isEditing = !!document;
    const payload = {
      ...form,
      personId: form.personId || null,
      issuedDate: form.issuedDate || null,
      issuedBy: form.issuedBy || null,
      documentId: form.documentId || null,
      notes: form.notes || null,
      fileUrl: form.fileUrl || null,
    };

    try {
      const res = await fetch(isEditing ? `/api/documents/${document.id}` : "/api/documents", {
        method: isEditing ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Gagal");
      toast("success", isEditing ? "Dokumen dikemas kini" : "Dokumen ditambah");
      onSaved();
    } catch (err: any) {
      toast("error", err.message ?? "Gagal menyimpan dokumen");
    } finally {
      setLoading(false);
    }
  }

  const isEditing = !!document;

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={isEditing ? "Edit Dokumen" : "Tambah Dokumen"}
      description={isEditing ? "Kemas kini maklumat dokumen" : "Simpan dokumen penting keluarga"}
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1.5">Tajuk <span className="text-red-500">*</span></label>
          <input
            type="text"
            value={form.title}
            onChange={(e) => set("title", e.target.value)}
            className={inputCls(errors.title)}
            placeholder="Sijil Kelahiran - Ahmad bin Abu"
          />
          {errors.title && <p className="mt-1 text-xs text-red-500">{errors.title}</p>}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">Jenis Dokumen</label>
            <select value={form.type} onChange={(e) => set("type", e.target.value)} className={inputCls()}>
              {DOC_TYPES.map((t) => (
                <option key={t.value} value={t.value}>
                  {t.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">Ahli Berkaitan</label>
            <select value={form.personId} onChange={(e) => set("personId", e.target.value)} className={inputCls()}>
              <option value="">— Tiada —</option>
              {(people ?? []).map((p: any) => (
                <option key={p.id} value={p.id}>
                  {fullName(p)}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">Tarikh Dikeluarkan</label>
            <input
              type="date"
              value={form.issuedDate}
              onChange={(e) => set("issuedDate", e.target.value)}
              className={inputCls()}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">Dikeluarkan Oleh</label>
            <input
              type="text"
              value={form.issuedBy}
              onChange={(e) => set("issuedBy", e.target.value)}
              className={inputCls()}
              placeholder="Jabatan Pendaftaran Negara"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">No. Rujukan Dokumen</label>
            <input
              type="text"
              value={form.documentId}
              onChange={(e) => set("documentId", e.target.value)}
              className={inputCls()}
              placeholder="BC-1990-1234"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">URL Fail</label>
            <input
              type="url"
              value={form.fileUrl}
              onChange={(e) => set("fileUrl", e.target.value)}
              className={inputCls(errors.fileUrl)}
              placeholder="https://..."
            />
            {errors.fileUrl && <p className="mt-1 text-xs text-red-500">{errors.fileUrl}</p>}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1.5">Catatan</label>
          <textarea
            value={form.notes}
            onChange={(e) => set("notes", e.target.value)}
            rows={3}
            className={inputCls() + " resize-none"}
            placeholder="Catatan tambahan tentang dokumen ini..."
          />
        </div>

        <div className="flex items-center justify-end gap-3 pt-2">
          <Button type="button" variant="outline" onClick={onClose} disabled={loading}>
            Batal
          </Button>
          <Button type="submit" loading={loading}>
            {isEditing ? "Simpan Perubahan" : "Tambah Dokumen"}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
