import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";

export async function GET() {
  const plans = await prisma.subscriptionPlan.findMany({ orderBy: { sortOrder: "asc" } });
  return NextResponse.json(plans);
}

export async function POST(req: Request) {
  const session = await auth();
  if (!session || (session.user as any)?.role !== "ADMIN") return NextResponse.json({ error: "Нет доступа" }, { status: 403 });
  
  const { platform, region, tier, duration, accountType, price } = await req.json();
  const plan = await prisma.subscriptionPlan.create({ 
    data: { 
      platform, 
      region: platform === "Xbox" ? "Турция" : region, // Жестко задаем Турцию для Xbox
      tier, 
      duration, 
      accountType: platform === "Xbox" ? accountType : null,
      price: Number(price) 
    } 
  });
  return NextResponse.json(plan);
}

export async function PUT(req: Request) {
  const session = await auth();
  if (!session || (session.user as any)?.role !== "ADMIN") return NextResponse.json({ error: "Нет доступа" }, { status: 403 });
  
  const { id, platform, region, tier, duration, accountType, price } = await req.json();
  
  const plan = await prisma.subscriptionPlan.update({ 
    where: { id }, 
    data: { 
      platform, 
      region: platform === "Xbox" ? "Турция" : region, // Жестко задаем Турцию для Xbox
      tier, 
      duration, 
      accountType: platform === "Xbox" ? accountType : null,
      price: Number(price) 
    } 
  });
  return NextResponse.json(plan);
}

export async function DELETE(req: Request) {
  const session = await auth();
  if (!session || (session.user as any)?.role !== "ADMIN") return NextResponse.json({ error: "Нет доступа" }, { status: 403 });
  
  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");
  if (id) await prisma.subscriptionPlan.delete({ where: { id } });
  return NextResponse.json({ success: true });
}