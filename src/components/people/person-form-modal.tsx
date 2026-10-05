"use client";

import { useEffect, useState } from "react";
import { Modal } from "@/components/ui/modal";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/toast";
import { fullName } from "@/lib/utils";

interface PersonFormModalProps {
  open: boolean;
  onClose: () => void;
  person?: any | null;
  onSaved?: () => void;
}

const empty = {
  firstName: "",
  lastName: "",
  gender: "MALE",
  status: "ALIVE",
  birthDate: "",
  deathDate: "",
  birthPlace: "",
  occupation: "",
  bio: "",
  email: "",
  phone: "",
};

function toDateInput(d?: string | Date | null): string {
  if (!d) return "";
  const date = new Date(d);
  if (isNaN(date.getTime())) return "";
  return date.toISOString().slice(0, 10);
}

export function PersonFormModal({ open, onClose, person, onSaved }: PersonFormModalProps) {
  const { toast } = useToast();
  const [form, setForm] = useState(empty);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (open) {
      setErrors({});
      setForm(
        person
          ? {
              firstName: person.firstName ?? "",
              lastName: person.lastName ?? "",
              gender: person.gender ?? "MALE",
              status: person.status ?? "ALIVE",
              birthDate: toDateInput(person.birthDate),
              deathDate: toDateInput(person.deathDate),
              birthPlace: person.birthPlace ?? "",
              occupation: person.occupation ?? "",
              bio: person.bio ?? "",
              email: person.email ?? "",
              phone: person.phone ?? "",
            }
          : empty
      );
    }
  }, [open, person]);

  function set(key: string, value: string) {
    setForm((f) => ({ ...f, [key]: value }));
    setErrors((e) => ({ ...e, [key]: "" }));
  }

  function validate() {
    const e: Record<string, string> = {};
    if (!form.firstName.trim()) e.firstName = "Nama diperlukan";
    if (form.email && !/^[^\s@]+@[^\s@]+$/.test(form.email)) e.email = "Email tidak sah";
    if (form.birthDate && form.deathDate && new Date(form.deathDate) < new Date(form.birthDate))
      e.deathDate = "Tarikh mati tidak boleh sebelum tarikh lahir";
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  async function handleSubmit(ev: React.FormEvent) {
    ev.preventDefault();
    if (!validate()) return;

    setLoading(true);
    const payload = {
      ...form,
      lastName: form.lastName || null,
      birthDate: form.birthDate || null,
      deathDate: form.deathDate || null,
      birthPlace: form.birthPlace || null,
      occupation: form.occupation || null,
      bio: form.bio || null,
      email: form.email || null,
      phone: form.phone || null,
    };

    const isEditing = !!person;
    const loadingId = toast("loading", isEditing ? "Menyimpan perubahan..." : "Menambah ahli...");

    try {
      const res = await fetch(isEditing ? `/api/people/${person.id}` : "/api/people", {
        method: isEditing ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Ralat");

      toast("success", isEditing ? `${fullName(data)} telah dikemas kini` : `${fullName(data)} ditambah ke salasilah`);
      onSaved?.();
    } catch (err: any) {
      toast("error", err.message ?? "Gagal menyimpan");
    } finally {
      setLoading(false);
    }
  }

  const isEditing = !!person;

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={isEditing ? "Edit Ahli Keluarga" : "Tambah Ahli Keluarga"}
      description={isEditing ? `Kemas kini maklumat ${fullName(person)}` : "Isi maklumat ahli keluarga baru"}
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Field label="Nama Pertama" required error={errors.firstName}>
            <input
              type="text"
              value={form.firstName}
              onChange={(e) => set("firstName", e.target.value)}
              className={inputCls(errors.firstName)}
              placeholder="Ahmad"
            />
          </Field>
          <Field label="Nama Keluarga">
            <input
              type="text"
              value={form.lastName}
              onChange={(e) => set("lastName", e.target.value)}
              className={inputCls()}
              placeholder="bin Muhammad"
            />
          </Field>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Field label="Jantina">
            <select value={form.gender} onChange={(e) => set("gender", e.target.value)} className={inputCls()}>
              <option value="MALE">Lelaki</option>
              <option value="FEMALE">Perempuan</option>
            </select>
          </Field>
          <Field label="Status">
            <select value={form.status} onChange={(e) => set("status", e.target.value)} className={inputCls()}>
              <option value="ALIVE">Hidup</option>
              <option value="DECEASED">Meninggal Dunia</option>
            </select>
          </Field>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Field label="Tarikh Lahir">
            <input
              type="date"
              value={form.birthDate}
              onChange={(e) => set("birthDate", e.target.value)}
              className={inputCls()}
            />
          </Field>
          <Field label="Tarikh Meninggal" error={errors.deathDate}>
            <input
              type="date"
              value={form.deathDate}
              onChange={(e) => set("deathDate", e.target.value)}
              className={inputCls(errors.deathDate)}
              disabled={form.status === "ALIVE"}
            />
          </Field>
        </div>

        <Field label="Tempat Lahir">
          <input
            type="text"
            value={form.birthPlace}
            onChange={(e) => set("birthPlace", e.target.value)}
            className={inputCls()}
            placeholder="Kuala Lumpur"
          />
        </Field>

        <Field label="Pekerjaan">
          <input
            type="text"
            value={form.occupation}
            onChange={(e) => set("occupation", e.target.value)}
            className={inputCls()}
            placeholder="Guru"
          />
        </Field>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Field label="Email" error={errors.email}>
            <input
              type="email"
              value={form.email}
              onChange={(e) => set("email", e.target.value)}
              className={inputCls(errors.email)}
              placeholder="ahli@keluarga.my"
            />
          </Field>
          <Field label="Telefon">
            <input
              type="text"
              value={form.phone}
              onChange={(e) => set("phone", e.target.value)}
              className={inputCls()}
              placeholder="+6012-345 6789"
            />
          </Field>
        </div>

        <Field label="Biografi Ringkas">
          <textarea
            value={form.bio}
            onChange={(e) => set("bio", e.target.value)}
            rows={3}
            className={inputCls() + " resize-none"}
            placeholder="Cerita ringkas tentang ahli ini..."
          />
        </Field>

        <div className="flex items-center justify-end gap-3 pt-2">
          <Button type="button" variant="outline" onClick={onClose} disabled={loading}>
            Batal
          </Button>
          <Button type="submit" loading={loading} disabled={loading}>
            {isEditing ? "Simpan Perubahan" : "Tambah Ahli"}
          </Button>
        </div>
      </form>
    </Modal>
  );
}

function inputCls(error?: string) {
  return `w-full px-3 py-2 rounded-lg border text-sm transition focus:outline-none focus:ring-2 ${
    error
      ? "border-red-300 focus:ring-red-500/20"
      : "border-slate-200 focus:ring-emerald-500/20 focus:border-emerald-500"
  }`;
}

function Field({
  label,
  required,
  error,
  children,
}: {
  label: string;
  required?: boolean;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label className="block text-sm font-medium text-slate-700 mb-1.5">
        {label}
        {required && <span className="text-red-500"> *</span>}
      </label>
      {children}
      {error && <p className="mt-1 text-xs text-red-500">{error}</p>}
    </div>
  );
}
