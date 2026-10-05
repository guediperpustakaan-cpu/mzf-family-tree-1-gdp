"use client";

import useSWR from "swr";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useState } from "react";
import {
  ArrowLeft,
  MapPin,
  Briefcase,
  Mail,
  Phone,
  Calendar,
  FileText,
  Heart,
  Users,
  Pencil,
  Cake,
} from "lucide-react";
import { Card, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { calculateAge, formatDate, fullName, initials } from "@/lib/utils";
import { PersonFormModal } from "@/components/people/person-form-modal";

const fetcher = (url: string) => fetch(url).then((r) => r.json());

export default function PersonDetailPage() {
  const params = useParams<{ id: string }>();
  const [editOpen, setEditOpen] = useState(false);

  const { data: person, error, isLoading, mutate } = useSWR(`/api/people/${params.id}`, fetcher, {
    revalidateOnFocus: false,
  });

  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="h-8 w-40 bg-slate-200 animate-pulse rounded-lg" />
        <Card className="p-8">
          <div className="flex items-center gap-5">
            <div className="w-24 h-24 rounded-3xl bg-slate-200 animate-pulse" />
            <div className="space-y-3 flex-1">
              <div className="h-6 w-1/3 bg-slate-200 animate-pulse rounded" />
              <div className="h-4 w-1/4 bg-slate-100 animate-pulse rounded" />
            </div>
          </div>
          <div className="mt-8 grid grid-cols-2 gap-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="h-16 bg-slate-50 animate-pulse rounded-xl" />
            ))}
          </div>
        </Card>
      </div>
    );
  }

  if (error || !person) {
    return (
      <Card className="p-16">
        <EmptyState
          icon={Users}
          title="Ahli tidak dijumpai"
          description="Rekod ahli ini mungkin telah dipadam."
          action={
            <Link href="/people">
              <Button variant="outline">Kembali ke senarai</Button>
            </Link>
          }
        />
      </Card>
    );
  }

  const name = fullName(person);
  const age = calculateAge(person.birthDate, person.deathDate);
  const isDeceased = person.status === "DECEASED";

  const parents = person.relationsTo?.filter((r: any) => r.type === "PARENT_CHILD").map((r: any) => r.from) ?? [];
  const children = person.relationsFrom?.filter((r: any) => r.type === "PARENT_CHILD").map((r: any) => r.to) ?? [];
  const spousesTo = person.relationsFrom?.filter((r: any) => r.type === "SPOUSE").map((r: any) => r.to) ?? [];
  const spousesFrom = person.relationsTo?.filter((r: any) => r.type === "SPOUSE").map((r: any) => r.from) ?? [];
  const allSpouses = [...spousesTo, ...spousesFrom];

  const info = [
    { icon: Calendar, label: "Tarikh Lahir", value: person.birthDate ? formatDate(person.birthDate) : null },
    ...(isDeceased
      ? [{ icon: Heart, label: "Tarikh Meninggal", value: person.deathDate ? formatDate(person.deathDate) : null }]
      : []),
    { icon: MapPin, label: "Tempat Lahir", value: person.birthPlace },
    { icon: Briefcase, label: "Pekerjaan", value: person.occupation },
    { icon: Mail, label: "Email", value: person.email },
    { icon: Phone, label: "Telefon", value: person.phone },
  ];

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <Link
        href="/people"
        className="inline-flex items-center gap-2 text-sm font-medium text-slate-500 hover:text-slate-900 transition"
      >
        <ArrowLeft className="w-4 h-4" />
        Kembali ke senarai
      </Link>

      <Card className="overflow-hidden">
        <div className="h-28 bg-gradient-to-br from-emerald-500 via-teal-600 to-cyan-700 relative">
          {isDeceased && (
            <span className="absolute top-4 right-4 text-xs font-medium text-white/90 bg-white/15 ring-1 ring-white/20 px-2.5 py-1 rounded-md backdrop-blur-sm">
              Mengenang {person.firstName}
            </span>
          )}
        </div>
        <div className="px-6 pb-6 -mt-12">
          <div className="flex flex-col sm:flex-row sm:items-end gap-4">
            <div className="w-24 h-24 rounded-3xl bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center text-white text-2xl font-bold ring-4 ring-white shadow-lg shrink-0">
              {initials(name)}
            </div>
            <div className="flex-1 min-w-0">
              <h1 className="text-2xl font-bold text-slate-900">{name}</h1>
              <div className="mt-1.5 flex flex-wrap items-center gap-2">
                <span
                  className={`text-xs font-medium px-2.5 py-1 rounded-md ${
                    person.gender === "MALE" ? "text-blue-700 bg-blue-50" : "text-pink-700 bg-pink-50"
                  }`}
                >
                  {person.gender === "MALE" ? "Lelaki" : "Perempuan"}
                </span>
                <span
                  className={`text-xs font-medium px-2.5 py-1 rounded-md ${
                    isDeceased ? "text-slate-600 bg-slate-100" : "text-emerald-700 bg-emerald-50"
                  }`}
                >
                  {isDeceased ? "Meninggal dunia" : age !== null ? `${age} tahun` : "Hidup"}
                </span>
                {person.birthDate && (
                  <span className="inline-flex items-center gap-1 text-xs text-slate-500">
                    <Cake className="w-3.5 h-3.5" />
                    {formatDate(person.birthDate, { day: "numeric", month: "long" })}
                  </span>
                )}
              </div>
            </div>
            <Button variant="outline" onClick={() => setEditOpen(true)} className="self-start sm:self-end">
              <Pencil className="w-4 h-4" />
              Edit
            </Button>
          </div>

          {person.bio && (
            <p className="mt-5 text-sm text-slate-600 leading-relaxed bg-slate-50 rounded-xl p-4 border border-slate-100">
              {person.bio}
            </p>
          )}

          <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-3">
            {info.map((item) => {
              const Icon = item.icon;
              const hasValue = !!item.value;
              return (
                <div
                  key={item.label}
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl border transition ${
                    hasValue ? "bg-white border-slate-200/80" : "bg-slate-50/50 border-slate-100"
                  }`}
                >
                  <Icon className={`w-4 h-4 shrink-0 ${hasValue ? "text-slate-400" : "text-slate-300"}`} />
                  <div className="min-w-0">
                    <p className="text-xs text-slate-400">{item.label}</p>
                    <p className={`text-sm truncate ${hasValue ? "font-medium text-slate-900" : "text-slate-400"}`}>
                      {item.value ?? "Tidak diisi"}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </Card>

      <section className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <FamilySection title="Ibu Bapa" people={parents} empty="Maklumat ibu bapa belum didaftarkan" />
        <FamilySection title="Pasangan" people={allSpouses} empty="Belum ada pasangan didaftarkan" />
        <FamilySection title="Anak-anak" people={children} empty="Belum ada anak didaftarkan" />

        <Card>
          <CardHeader
            title="Dokumen"
            description={`${person.documents?.length ?? 0} dokumen berkaitan`}
            action={
              <Link href="/documents" className="text-sm font-medium text-emerald-600 hover:text-emerald-700">
                Lihat semua
              </Link>
            }
          />
          <div className="p-4">
            {person.documents?.length ? (
              <ul className="space-y-2">
                {person.documents.map((doc: any) => (
                  <li
                    key={doc.id}
                    className="flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-slate-50 transition"
                  >
                    <div className="w-9 h-9 rounded-lg bg-blue-50 flex items-center justify-center shrink-0">
                      <FileText className="w-4 h-4 text-blue-600" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium text-slate-900 truncate">{doc.title}</p>
                      <p className="text-xs text-slate-400">
                        {doc.issuedDate
                          ? formatDate(doc.issuedDate, { year: "numeric", month: "short" })
                          : "Tarikh tidak diisi"}
                      </p>
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              <EmptyState icon={FileText} title="Tiada dokumen" description="Tambah dokumen berkaitan ahli ini." />
            )}
          </div>
        </Card>
      </section>

      <PersonFormModal
        open={editOpen}
        onClose={() => setEditOpen(false)}
        person={person}
        onSaved={() => {
          setEditOpen(false);
          mutate();
        }}
      />
    </div>
  );
}

function FamilySection({ title, people, empty }: { title: string; people: any[]; empty: string }) {
  return (
    <Card>
      <CardHeader title={title} description={`${people.length} orang`} />
      <div className="p-4">
        {people.length === 0 ? (
          <EmptyState icon={Users} title="Kosong" description={empty} />
        ) : (
          <ul className="space-y-2">
            {people.map((p) => {
              const age = calculateAge(p.birthDate, p.deathDate);
              return (
                <li key={p.id}>
                  <Link
                    href={`/people/${p.id}`}
                    className="flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-slate-50 transition group"
                  >
                    <div className="w-9 h-9 rounded-full bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center text-white text-xs font-semibold shrink-0">
                      {initials(fullName(p))}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium text-slate-900 truncate group-hover:text-emerald-600 transition">
                        {fullName(p)}
                      </p>
                      <p className="text-xs text-slate-400 truncate">
                        {p.occupation ?? (age !== null ? `${age} tahun` : "—")}
                      </p>
                    </div>
                    {p.status === "DECEASED" && (
                      <span className="text-xs text-slate-500 bg-slate-100 px-2 py-0.5 rounded-md">Meninggal</span>
                    )}
                  </Link>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </Card>
  );
}
