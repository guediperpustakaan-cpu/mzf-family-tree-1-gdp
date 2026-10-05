"use client";

import useSWR from "swr";
import {
  Users,
  Baby,
  Heart,
  FileText,
  TrendingUp,
  Cake,
  UserPlus,
  Calendar,
} from "lucide-react";
import { Card, CardHeader } from "@/components/ui/card";
import { StatsSkeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/ui/empty-state";
import { calculateAge, formatDate, fullName } from "@/lib/utils";
import Link from "next/link";

const fetcher = (url: string) => fetch(url).then((r) => r.json());

interface Stats {
  totalPeople: number;
  alive: number;
  deceased: number;
  totalDocuments: number;
  male: number;
  female: number;
  relationships: number;
  docsByType: { type: string; count: number }[];
  ageBuckets: { label: string; count: number }[];
  upcomingBirthdays: { id: string; name: string; date: string; turning: number }[];
  recentPeople: any[];
}

const docTypeLabels: Record<string, string> = {
  BIRTH_CERTIFICATE: "Sijil Kelahiran",
  MARRIAGE_CERTIFICATE: "Sijil Kahwin",
  DEATH_CERTIFICATE: "Sijil Kematian",
  IDENTITY_CARD: "Kad Pengenalan",
  PHOTO: "Gambar",
  LETTER: "Surat",
  OTHER: "Lain-lain",
};

export default function DashboardPage() {
  const { data, error, isLoading } = useSWR<Stats>("/api/stats", fetcher, {
    revalidateOnFocus: false,
  });

  if (error) {
    return (
      <Card className="p-16">
        <EmptyState
          icon={FileText}
          title="Gagal memuatkan statistik"
          description="Terdapat ralat semasa memuatkan data. Cuba lagi."
        />
      </Card>
    );
  }

  if (isLoading || !data) {
    return (
      <div className="space-y-8">
        <StatsSkeleton />
        <Card className="p-6 space-y-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-8 bg-slate-100 animate-pulse rounded-lg" />
          ))}
        </Card>
      </div>
    );
  }

  const stats = [
    { label: "Jumlah Ahli", value: data.totalPeople, icon: Users, color: "from-emerald-500 to-teal-600" },
    { label: "Masih Hidup", value: data.alive, icon: Heart, color: "from-rose-500 to-pink-600" },
    { label: "Meninggal Dunia", value: data.deceased, icon: FileText, color: "from-slate-500 to-slate-700" },
    { label: "Dokumen", value: data.totalDocuments, icon: FileText, color: "from-blue-500 to-indigo-600" },
  ];

  const maxBucket = Math.max(...data.ageBuckets.map((b) => b.count), 1);
  const maxDocType = Math.max(...data.docsByType.map((d) => d.count), 1);

  return (
    <div className="space-y-8">
      <section className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-emerald-600 via-teal-600 to-cyan-700 p-6 sm:p-8 text-white">
        <div className="absolute -top-8 -right-8 w-48 h-48 rounded-full bg-white/10" />
        <div className="absolute -bottom-12 -left-8 w-40 h-40 rounded-full bg-white/5" />
        <div className="relative">
          <div className="flex items-center gap-2 text-emerald-100 text-sm font-medium">
            <Baby className="w-4 h-4" />
            <span>untuk semua umur</span>
          </div>
          <h2 className="mt-2 text-2xl sm:text-3xl font-bold">Selamat datang ke Salasilah Keluarga</h2>
          <p className="mt-1.5 text-emerald-50/90 max-w-xl">
            Lengkapkan rekod keluarga besar kita — dari datuk nenek hingga cucu cicit. Setiap cerita, setiap dokumen, setiap kenangan.
          </p>
          <div className="mt-5 flex flex-wrap gap-3">
            <Link
              href="/people"
              className="inline-flex items-center gap-2 bg-white text-emerald-700 font-medium px-4 py-2 rounded-lg hover:bg-emerald-50 transition"
            >
              <UserPlus className="w-4 h-4" />
              Tambah Ahli Keluarga
            </Link>
            <Link
              href="/tree"
              className="inline-flex items-center gap-2 bg-white/10 text-white font-medium px-4 py-2 rounded-lg hover:bg-white/20 transition ring-1 ring-white/20"
            >
              <TrendingUp className="w-4 h-4" />
              Lihat Salasilah
            </Link>
          </div>
        </div>
        <div className="absolute top-6 right-6 hidden md:flex items-center gap-2 text-emerald-100/80 text-sm">
          <Calendar className="w-4 h-4" />
          {formatDate(new Date())}
        </div>
      </section>

      <section className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((s) => {
          const Icon = s.icon;
          return (
            <Card key={s.label} className="p-5 hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between">
                <p className="text-sm text-slate-500 font-medium">{s.label}</p>
                <div className={`w-9 h-9 rounded-lg bg-gradient-to-br ${s.color} flex items-center justify-center`}>
                  <Icon className="w-4 h-4 text-white" />
                </div>
              </div>
              <p className="mt-3 text-3xl font-bold text-slate-900 tabular-nums">{s.value}</p>
              <p className="mt-1 text-xs text-slate-400">
                {s.label === "Jumlah Ahli" && `${data.male} lelaki · ${data.female} perempuan`}
                {s.label === "Dokumen" && `${data.relationships} hubungan dicatatkan`}
              </p>
            </Card>
          );
        })}
      </section>

      <section className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2">
          <CardHeader title="Taburan Umur Ahli Keluarga" description="Golongan umur dalam keluarga besar kita" />
          <div className="p-6 space-y-4">
            {data.ageBuckets.map((b) => (
              <div key={b.label} className="flex items-center gap-4">
                <span className="w-14 text-sm font-medium text-slate-600 shrink-0">{b.label}</span>
                <div className="flex-1 h-7 bg-slate-50 rounded-lg overflow-hidden ring-1 ring-slate-100">
                  <div
                    className="h-full bg-gradient-to-r from-emerald-400 to-teal-500 rounded-lg transition-all duration-500"
                    style={{ width: `${(b.count / maxBucket) * 100}%` }}
                  />
                </div>
                <span className="w-8 text-right text-sm font-semibold text-slate-900 tabular-nums">{b.count}</span>
              </div>
            ))}
          </div>
        </Card>

        <Card>
          <CardHeader title="Hari Jadi Hadapan" description="Dalam 30 hari akan datang" />
          <div className="p-4">
            {data.upcomingBirthdays.length === 0 ? (
              <EmptyState icon={Cake} title="Tiada hari jadi" description="Tiada hari jadi akan datang dalam 30 hari." />
            ) : (
              <ul className="space-y-2">
                {data.upcomingBirthdays.map((b) => (
                  <li key={b.id}>
                    <Link
                      href={`/people/${b.id}`}
                      className="flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-slate-50 transition group"
                    >
                      <div className="w-9 h-9 rounded-full bg-gradient-to-br from-rose-100 to-pink-100 flex items-center justify-center shrink-0">
                        <Cake className="w-4 h-4 text-rose-600" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-medium text-slate-900 truncate">{b.name}</p>
                        <p className="text-xs text-slate-400">
                          {formatDate(b.date, { day: "numeric", month: "short" })}
                        </p>
                      </div>
                      <span className="text-xs font-semibold text-rose-600 bg-rose-50 px-2 py-1 rounded-md">
                        {b.turning} thn
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </Card>
      </section>

      <section className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader
            title="Ahli Terkini"
            description="Pendaftaran terbaru dalam salasilah"
            action={
              <Link href="/people" className="text-sm font-medium text-emerald-600 hover:text-emerald-700">
                Lihat semua
              </Link>
            }
          />
          <div className="p-4">
            {data.recentPeople.length === 0 ? (
              <EmptyState icon={Users} title="Belum ada ahli" description="Tambah ahli keluarga pertama anda." />
            ) : (
              <ul className="space-y-2">
                {data.recentPeople.map((p) => {
                  const age = calculateAge(p.birthDate, p.deathDate);
                  return (
                    <li key={p.id}>
                      <Link
                        href={`/people/${p.id}`}
                        className="flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-slate-50 transition"
                      >
                        <Avatar person={p} />
                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-medium text-slate-900 truncate">{fullName(p)}</p>
                          <p className="text-xs text-slate-400 truncate">
                            {p.occupation ?? (age !== null ? `${age} tahun` : "—")}
                          </p>
                        </div>
                        <StatusBadge status={p.status} />
                      </Link>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>
        </Card>

        <Card>
          <CardHeader title="Jenis Dokumen" description="Pecahan dokumen yang disimpan" />
          <div className="p-6 space-y-4">
            {data.docsByType.length === 0 ? (
              <EmptyState icon={FileText} title="Tiada dokumen" description="Tambah dokumen keluarga pertama anda." />
            ) : (
              data.docsByType.map((d) => (
                <div key={d.type} className="flex items-center gap-4">
                  <span className="w-32 text-xs font-medium text-slate-600 shrink-0">
                    {docTypeLabels[d.type] ?? d.type}
                  </span>
                  <div className="flex-1 h-6 bg-slate-50 rounded-lg overflow-hidden ring-1 ring-slate-100">
                    <div
                      className="h-full bg-gradient-to-r from-blue-400 to-indigo-500 rounded-lg transition-all duration-500"
                      style={{ width: `${(d.count / maxDocType) * 100}%` }}
                    />
                  </div>
                  <span className="w-8 text-right text-sm font-semibold text-slate-900 tabular-nums">{d.count}</span>
                </div>
              ))
            )}
          </div>
        </Card>
      </section>
    </div>
  );
}

function Avatar({ person }: { person: any }) {
  const name = fullName(person);
  const inits = name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase() ?? "")
    .join("");
  return (
    <div className="w-9 h-9 rounded-full bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center text-white text-xs font-semibold shrink-0">
      {inits}
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  return status === "DECEASED" ? (
    <span className="text-xs font-medium text-slate-500 bg-slate-100 px-2 py-1 rounded-md">Meninggal</span>
  ) : (
    <span className="text-xs font-medium text-emerald-600 bg-emerald-50 px-2 py-1 rounded-md">Hidup</span>
  );
}
