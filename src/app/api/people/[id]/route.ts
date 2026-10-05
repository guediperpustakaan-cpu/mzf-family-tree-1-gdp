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

export async function GET(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Tidak dibenarkan" }, { status: 401 });

  const person = await withRetry(() =>
    prisma.person.findUnique({
      where: { id: params.id },
      include: {
        documents: { orderBy: { issuedDate: "desc" } },
        relationsFrom: { include: { to: true } },
        relationsTo: { include: { from: true } },
      },
    })
  );

  if (!person) return NextResponse.json({ error: "Tidak dijumpai" }, { status: 404 });

  return NextResponse.json(person);
}

export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
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
  const existing = await withRetry(() => prisma.person.findUnique({ where: { id: params.id } }));
  if (!existing) return NextResponse.json({ error: "Tidak dijumpai" }, { status: 404 });

  const person = await withRetry(() =>
    prisma.person.update({
      where: { id: params.id },
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

  return NextResponse.json(person);
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Tidak dibenarkan" }, { status: 401 });

  const existing = await withRetry(() => prisma.person.findUnique({ where: { id: params.id } }));
  if (!existing) return NextResponse.json({ error: "Tidak dijumpai" }, { status: 404 });

  await withRetry(() => prisma.person.delete({ where: { id: params.id } }));

  return NextResponse.json({ success: true });
}
