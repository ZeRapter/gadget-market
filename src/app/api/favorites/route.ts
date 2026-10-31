import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";

// Получить список избранных товаров (ID)
export async function GET() {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Не авторизован" }, { status: 401 });

  const favorites = await prisma.favorite.findMany({
    where: { userId: (session.user as any).id },
    select: { productId: true },
  });

  return NextResponse.json(favorites.map(f => f.productId));
}

// Добавить в избранное
export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Не авторизован" }, { status: 401 });

  const { productId } = await req.json();
  if (!productId) return NextResponse.json({ error: "Не передан productId" }, { status: 400 });

  try {
    await prisma.favorite.upsert({
      where: {
        userId_productId: {
          userId: (session.user as any).id,
          productId,
        },
      },
      create: {
        userId: (session.user as any).id,
        productId,
      },
      update: {},
    });
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: "Ошибка добавления" }, { status: 500 });
  }
}

// Удалить из избранного
export async function DELETE(req: Request) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Не авторизован" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const productId = searchParams.get("productId");
  if (!productId) return NextResponse.json({ error: "Не передан productId" }, { status: 400 });

  try {
    await prisma.favorite.delete({
      where: {
        userId_productId: {
          userId: (session.user as any).id,
          productId,
        },
      },
    });
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: "Ошибка удаления" }, { status: 500 });
  }
}