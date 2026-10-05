import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma, withRetry } from "@/lib/prisma";
import { calculateAge, fullName } from "@/lib/utils";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Tidak dibenarkan" }, { status: 401 });

  const [totalPeople, alive, deceased, totalDocuments, male, female, relationships] = await Promise.all([
    withRetry(() => prisma.person.count()),
    withRetry(() => prisma.person.count({ where: { status: "ALIVE" } })),
    withRetry(() => prisma.person.count({ where: { status: "DECEASED" } })),
    withRetry(() => prisma.document.count()),
    withRetry(() => prisma.person.count({ where: { gender: "MALE" } })),
    withRetry(() => prisma.person.count({ where: { gender: "FEMALE" } })),
    withRetry(() => prisma.relationship.count()),
  ]);

  const docsByType = await withRetry(() => prisma.document.groupBy({ by: ["type"], _count: true }));

  const living = await withRetry(() =>
    prisma.person.findMany({
      where: { status: "ALIVE", birthDate: { not: null } },
      select: { id: true, firstName: true, lastName: true, birthDate: true },
    })
  );

  const now = new Date();
  const ageBuckets = [
    { label: "0-12", min: 0, max: 12, count: 0 },
    { label: "13-19", min: 13, max: 19, count: 0 },
    { label: "20-35", min: 20, max: 35, count: 0 },
    { label: "36-50", min: 36, max: 50, count: 0 },
    { label: "51-69", min: 51, max: 69, count: 0 },
    { label: "70+", min: 70, max: 200, count: 0 },
  ];

  for (const p of living) {
    const age = calculateAge(p.birthDate);
    const b = ageBuckets.find((b) => age !== null && age >= b.min && age <= b.max);
    if (b) b.count++;
  }

  const upcomingBirthdays = living
    .map((p) => {
      const bd = new Date(now.getFullYear(), p.birthDate!.getMonth(), p.birthDate!.getDate());
      if (bd < new Date(now.getFullYear(), now.getMonth(), now.getDate())) bd.setFullYear(now.getFullYear() + 1);
      return { id: p.id, name: fullName(p), date: bd.toISOString(), turning: bd.getFullYear() - p.birthDate!.getFullYear() };
    })
    .filter((p) => Math.round((new Date(p.date).getTime() - now.getTime()) / 86400000) <= 30)
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    .slice(0, 6);

  const recentPeople = await withRetry(() =>
    prisma.person.findMany({
      orderBy: { createdAt: "desc" },
      take: 5,
    })
  );

  return NextResponse.json({
    totalPeople,
    alive,
    deceased,
    totalDocuments,
    male,
    female,
    relationships,
    docsByType: docsByType.map((d) => ({ type: d.type, count: d._count })),
    ageBuckets,
    upcomingBirthdays,
    recentPeople: recentPeople.map((p) => ({ ...p, name: fullName(p) })),
  });
}
