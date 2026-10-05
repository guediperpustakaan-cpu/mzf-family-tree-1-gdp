import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma, withRetry } from "@/lib/prisma";
import { z } from "zod";

const docSchema = z.object({
  title: z.string().min(1, "Tajuk diperlukan"),
  type: z.enum([
    "BIRTH_CERTIFICATE",
    "MARRIAGE_CERTIFICATE",
    "DEATH_CERTIFICATE",
    "IDENTITY_CARD",
    "PHOTO",
    "LETTER",
    "OTHER",
  ]),
  personId: z.string().optional().nullable(),
  issuedDate: z.string().optional().nullable(),
  issuedBy: z.string().optional().nullable(),
  documentId: z.string().optional().nullable(),
  notes: z.string().optional().nullable(),
  fileUrl: z.string().url().optional().or(z.literal("")).nullable(),
});

function toIso(v?: string | null): Date | null {
  if (!v) return null;
  const d = new Date(v);
  return isNaN(d.getTime()) ? null : d;
}

export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Tidak dibenarkan" }, { status: 401 });

  const body = await req.json().catch(() => null);
  const parsed = docSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Data tidak sah", details: parsed.error.flatten().fieldErrors },
      { status: 400 }
    );
  }

  const d = parsed.data;
  const existing = await withRetry(() => prisma.document.findUnique({ where: { id: params.id } }));
  if (!existing) return NextResponse.json({ error: "Tidak dijumpai" }, { status: 404 });

  const doc = await withRetry(() =>
    prisma.document.update({
      where: { id: params.id },
      data: {
        title: d.title,
        type: d.type,
        personId: d.personId || null,
        issuedDate: toIso(d.issuedDate),
        issuedBy: d.issuedBy,
        documentId: d.documentId,
        notes: d.notes,
        fileUrl: d.fileUrl || null,
      },
      include: { person: true },
    })
  );

  return NextResponse.json(doc);
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Tidak dibenarkan" }, { status: 401 });

  const existing = await withRetry(() => prisma.document.findUnique({ where: { id: params.id } }));
  if (!existing) return NextResponse.json({ error: "Tidak dijumpai" }, { status: 404 });

  await withRetry(() => prisma.document.delete({ where: { id: params.id } }));

  return NextResponse.json({ success: true });
}
