import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma, withRetry } from "@/lib/prisma";

export async function DELETE(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Tidak dibenarkan" }, { status: 401 });

  const existing = await withRetry(() => prisma.relationship.findUnique({ where: { id: params.id } }));
  if (!existing) return NextResponse.json({ error: "Tidak dijumpai" }, { status: 404 });

  await withRetry(() => prisma.relationship.delete({ where: { id: params.id } }));

  return NextResponse.json({ success: true });
}
