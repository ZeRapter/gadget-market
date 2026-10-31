import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Не авторизован" }, { status: 401 });

  const { productIds } = await req.json();
  if (!Array.isArray(productIds) || productIds.length === 0) {
    return NextResponse.json({ success: true });
  }

  try {
    // Сохраняем каждый товар в БД (если его еще нет)
    for (const id of productIds) {
      await prisma.favorite.upsert({
        where: {
          userId_productId: {
            userId: (session.user as any).id,
            productId: id,
          },
        },
        create: {
          userId: (session.user as any).id,
          productId: id,
        },
        update: {},
      });
    }
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: "Ошибка слияния" }, { status: 500 });
  }
}