import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session || ((session.user as any)?.role !== "ADMIN" && (session.user as any)?.role !== "SELLER")) {
    return NextResponse.json({ error: "Нет доступа" }, { status: 403 });
  }

  const { id } = await params;
  const { category, name, deviceModel, price, isFromPrice, priceUnit } = await req.json();

  const updated = await prisma.repairService.update({
    where: { id },
    data: { 
      category, 
      name, 
      deviceModel: deviceModel || null, 
      price: Number(price),
      isFromPrice: Boolean(isFromPrice),
      priceUnit: priceUnit || null
    },
  });
  return NextResponse.json(updated);
}

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session || ((session.user as any)?.role !== "ADMIN" && (session.user as any)?.role !== "SELLER")) {
    return NextResponse.json({ error: "Нет доступа" }, { status: 403 });
  }

  const { id } = await params;
  await prisma.repairService.delete({ where: { id } });
  return NextResponse.json({ success: true });
}