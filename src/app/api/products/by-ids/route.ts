import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  const { ids } = await req.json();
  
  if (!Array.isArray(ids) || ids.length === 0) {
    return NextResponse.json([]);
  }

  const products = await prisma.product.findMany({
    where: { id: { in: ids } },
  });

  return NextResponse.json(products);
}