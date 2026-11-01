import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";

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

    // УМНАЯ ЛОГИКА (Такая же, как при создании)
    if (data.specs && data.specs["Ревизия"]) {
      const revValue = data.specs["Ревизия"].trim();
      if (revValue) {
        try {
          let attrType = await prisma.attributeType.findUnique({ where: { name: "Ревизия" } });
          
          if (!attrType) {
            attrType = await prisma.attributeType.create({
              data: { 
                name: "Ревизия", 
                categories: { connect: [{ id: data.categoryId }] } 
              }
            });
          } else {
            await prisma.attributeType.update({
              where: { id: attrType.id },
              data: { categories: { connect: [{ id: data.categoryId }] } }
            });
          }

          const existingVal = await prisma.attributeValue.findFirst({
            where: { attributeTypeId: attrType.id, value: revValue }
          });

          if (!existingVal) {
            await prisma.attributeValue.create({
              data: { attributeTypeId: attrType.id, value: revValue }
            });
          }
        } catch (e) {
          console.error("Ошибка при обновлении справочника ревизий:", e);
        }
      }
    }

    const updatedProduct = await prisma.product.update({
      where: { id },
      data: {
        name: data.name,
        sku: data.sku,
        description: data.description,
        priceCash: data.priceCash,
        priceCard: data.priceCard,
        condition: data.condition,
        warranty: data.warranty, // <-- ДОБАВЛЕНО
        availability: data.availability,
        categoryId: data.categoryId,
        maxBookingHours: data.maxBookingHours,
        images: data.images,
        specs: data.specs,
      },
    });

    return NextResponse.json(updatedProduct);
  } catch (error) {
    console.error("Ошибка обновления:", error);
    return NextResponse.json({ error: "Ошибка сервера при обновлении" }, { status: 500 });
  }
}