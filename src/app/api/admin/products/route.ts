import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";

export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session || ((session.user as any)?.role !== "ADMIN" && (session.user as any)?.role !== "SELLER")) {
      return NextResponse.json({ error: "Доступ запрещен" }, { status: 403 });
    }

    const data = await req.json();

    // УМНАЯ ЛОГИКА: Сохраняем новую "Ревизию" в справочник для этой категории
    if (data.specs && data.specs["Ревизия"]) {
      const revValue = data.specs["Ревизия"].trim();
      if (revValue) {
        try {
          // 1. Ищем тип характеристики "Ревизия"
          let attrType = await prisma.attributeType.findUnique({ where: { name: "Ревизия" } });
          
          if (!attrType) {
            // Если нет — создаем и привязываем к текущей категории
            attrType = await prisma.attributeType.create({
              data: { 
                name: "Ревизия", 
                categories: { connect: [{ id: data.categoryId }] } 
              }
            });
          } else {
            // Если есть — просто добавляем связь с текущей категорией (если ее нет)
            await prisma.attributeType.update({
              where: { id: attrType.id },
              data: { categories: { connect: [{ id: data.categoryId }] } }
            });
          }

          // 2. Проверяем, есть ли такое значение
          const existingVal = await prisma.attributeValue.findFirst({
            where: { attributeTypeId: attrType.id, value: revValue }
          });

          // 3. Если нет — создаем
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

    const product = await prisma.product.create({
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

    return NextResponse.json(product, { status: 201 });
  } catch (error) {
    console.error("Ошибка добавления товара:", error);
    return NextResponse.json({ error: "Ошибка сервера" }, { status: 500 });
  }
}