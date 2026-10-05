import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma, withRetry } from "@/lib/prisma";
import { z } from "zod";

const personSchema = z.object({
  firstName: z.string().min(1, "Nama diperlukan"),
  lastName: z.string().optional().nullable(),
  gender: z.enum(["MALE", "FEMALE"]),
  status: z.enum(["ALIVE", "DECEASED"]).optional().default("ALIVE"),
  birthDate: z.string().optional().nullable(),
  deathDate: z.string().optional().nullable(),
  birthPlace: z.string().optional().nullable(),
  occupation: z.string().optional().nullable(),
  bio: z.string().optional().nullable(),
  photoUrl: z.string().url().optional().or(z.literal("")).nullable(),
  email: z.string().email().optional().or(z.literal("")).nullable(),
  phone: z.string().optional().nullable(),
});

function toIso(v?: string | null): Date | null {
  if (!v) return null;
  const d = new Date(v);
  return isNaN(d.getTime()) ? null : d;
}

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Tidak dibenarkan" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const q = searchParams.get("q") ?? "";
  const gender = searchParams.get("gender");
  const status = searchParams.get("status");

  const people = await withRetry(() =>
    prisma.person.findMany({
      where: {
        AND: [
          q
            ? {
                OR: [
                  { firstName: { contains: q, mode: "insensitive" } },
                  { lastName: { contains: q, mode: "insensitive" } },
                  { occupation: { contains: q, mode: "insensitive" } },
                  { birthPlace: { contains: q, mode: "insensitive" } },
                ],
              }
            : {},
          gender ? { gender: gender as any } : {},
          status ? { status: status as any } : {},
        ],
      },
      orderBy: [{ birthDate: "asc" }],
      include: { documents: { select: { id: true } } },
    })
  );

  return NextResponse.json(people);
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Tidak dibenarkan" }, { status: 401 });

  const body = await req.json().catch(() => null);
  const parsed = personSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Data tidak sah", details: parsed.error.flatten().fieldErrors },
      { status: 400 }
    );
  }

  const d = parsed.data;
  const person = await withRetry(() =>
    prisma.person.create({
      data: {
        firstName: d.firstName,
        lastName: d.lastName,
        gender: d.gender,
        status: d.status,
        birthDate: toIso(d.birthDate),
        deathDate: toIso(d.deathDate),
        birthPlace: d.birthPlace,
        occupation: d.occupation,
        bio: d.bio,
        photoUrl: d.photoUrl || null,
        email: d.email || null,
        phone: d.phone,
      },
    })
  );

  return NextResponse.json(person, { status: 201 });
}
