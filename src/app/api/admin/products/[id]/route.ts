import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";

// УДАЛЕНИЕ
export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session || ((session.user as any)?.role !== "ADMIN" && (session.user as any)?.role !== "SELLER")) {
      return NextResponse.json({ error: "Доступ запрещен" }, { status: 403 });
    }

    const { id } = await params;
    await prisma.product.delete({ where: { id } });

    return NextResponse.json({ message: "Товар удален" });
  } catch (error) {
    return NextResponse.json({ error: "Не удалось удалить товар" }, { status: 500 });
  }
}

// ОБНОВЛЕНИЕ (РЕДАКТИРОВАНИЕ)
export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session || ((session.user as any)?.role !== "ADMIN" && (session.user as any)?.role !== "SELLER")) {
      return NextResponse.json({ error: "Доступ запрещен" }, { status: 403 });
    }

    const { id } = await params;
    const data = await req.json();

    const updatedProduct = await prisma.product.update({
      where: { id },
      data: {
        name: data.name,
        sku: data.sku,
        description: data.description,
        priceCash: data.priceCash,
        priceCard: data.priceCard,
        condition: data.condition,
        availability: data.availability,
        categoryId: data.categoryId,
        maxBookingHours: data.maxBookingHours,
        images: data.images,
      },
    });

    return NextResponse.json(updatedProduct);
  } catch (error) {
    console.error("Ошибка обновления:", error);
    return NextResponse.json({ error: "Ошибка сервера при обновлении" }, { status: 500 });
  }
}