import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";

export async function GET() {
  const services = await prisma.repairService.findMany({
    orderBy: [{ name: "asc" }, { price: "asc" }],
  });
  return NextResponse.json(services);
}

export async function POST(req: Request) {
  const session = await auth();
  if (!session || ((session.user as any)?.role !== "ADMIN" && (session.user as any)?.role !== "SELLER")) {
    return NextResponse.json({ error: "Нет доступа" }, { status: 403 });
  }
  
  const { category, name, deviceModel, price, isFromPrice, priceUnit } = await req.json();
  const service = await prisma.repairService.create({ 
    data: { 
      category, 
      name, 
      deviceModel: deviceModel || null, 
      price: Number(price),
      isFromPrice: Boolean(isFromPrice),
      priceUnit: priceUnit || null
    } 
  });
  return NextResponse.json(service);
}