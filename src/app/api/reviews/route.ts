import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const productId = searchParams.get("productId");
  if (!productId) return NextResponse.json({ error: "Нет ID товара" }, { status: 400 });

  const reviews = await prisma.review.findMany({
    where: { productId },
    include: { user: { select: { name: true } } },
    orderBy: { createdAt: "desc" },
  });
  return NextResponse.json(reviews);
}

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Необходимо войти" }, { status: 401 });

  const { productId, rating, text, images } = await req.json(); // <--- Принимаем images
  if (!productId || !rating) return NextResponse.json({ error: "Не хватает данных" }, { status: 400 });

  try {
    const review = await prisma.review.create({
      data: {
        userId: (session.user as any).id,
        productId,
        rating: Number(rating),
        text: text || null,
        images: images || [], // <--- Сохраняем массив картинок
      },
      include: { user: { select: { name: true } } },
    });
    return NextResponse.json(review);
  } catch (e) {
    return NextResponse.json({ error: "Ошибка при сохранении" }, { status: 500 });
  }
}