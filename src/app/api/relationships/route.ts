import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma, withRetry } from "@/lib/prisma";
import { z } from "zod";

const relSchema = z.object({
  type: z.enum(["PARENT_CHILD", "SPOUSE"]),
  fromId: z.string().min(1),
  toId: z.string().min(1),
  note: z.string().optional().nullable(),
});

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Tidak dibenarkan" }, { status: 401 });

  const rels = await withRetry(() =>
    prisma.relationship.findMany({
      include: { from: true, to: true },
      orderBy: { createdAt: "asc" },
    })
  );

  return NextResponse.json(rels);
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Tidak dibenarkan" }, { status: 401 });

  const body = await req.json().catch(() => null);
  const parsed = relSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Data tidak sah", details: parsed.error.flatten().fieldErrors },
      { status: 400 }
    );
  }

  const d = parsed.data;
  if (d.fromId === d.toId) {
    return NextResponse.json({ error: "Tidak boleh menghubungkan dengan diri sendiri" }, { status: 400 });
  }

  const existing = await withRetry(() =>
    prisma.relationship.findUnique({
      where: { type_fromId_toId: { type: d.type, fromId: d.fromId, toId: d.toId } },
    })
  );
  if (existing) {
    return NextResponse.json({ error: "Hubungan ini sudah wujud" }, { status: 409 });
  }

  // For spouse relations, store canonical direction but allow either direction to match
  const rel = await withRetry(() =>
    prisma.relationship.create({
      data: { type: d.type, fromId: d.fromId, toId: d.toId, note: d.note },
      include: { from: true, to: true },
    })
  );

  return NextResponse.json(rel, { status: 201 });
}
