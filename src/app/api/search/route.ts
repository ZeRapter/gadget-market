import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const q = searchParams.get("q");

  if (!q || q.trim() === "") {
    return NextResponse.json([]);
  }

  try {
    const products = await prisma.product.findMany({
      where: {
        OR: [
          { name: { contains: q, mode: "insensitive" } }, // Ищем по названию
          { sku: { contains: q, mode: "insensitive" } },  // Ищем по артикулу
        ],
      },
      take: 20, // Ограничим выдачу 20 товарами
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(products);
  } catch (error) {
    return NextResponse.json({ error: "Ошибка поиска" }, { status: 500 });
  }
}