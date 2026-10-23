import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";

export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session || (session.user as any)?.role !== "ADMIN" && (session.user as any)?.role !== "SELLER") {
      return NextResponse.json({ error: "Доступ запрещен" }, { status: 403 });
    }

    const data = await req.json();

    const product = await prisma.product.create({
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

    return NextResponse.json(product, { status: 201 });
  } catch (error) {
    console.error("Ошибка добавления товара:", error);
    return NextResponse.json({ error: "Ошибка сервера" }, { status: 500 });
  }
}