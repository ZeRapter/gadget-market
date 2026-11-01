import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";

// Обновление типа характеристики
export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session || ((session.user as any)?.role !== "ADMIN" && (session.user as any)?.role !== "SELLER")) {
    return NextResponse.json({ error: "Нет доступа" }, { status: 403 });
  }

  const { id } = await params;
  const { name, categoryIds } = await req.json();

  try {
    const updated = await prisma.attributeType.update({
      where: { id },
      data: {
        name,
        categories: {
          set: categoryIds?.length 
            ? categoryIds.map((cid: string) => ({ id: cid })) 
            : [], // Если пусто — отвязываем от всех (будет для всех категорий)
        },
      },
      include: { categories: true },
    });
    return NextResponse.json(updated);
  } catch (error) {
    return NextResponse.json({ error: "Ошибка обновления" }, { status: 500 });
  }
}

// Удаление типа характеристики
export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session || ((session.user as any)?.role !== "ADMIN" && (session.user as any)?.role !== "SELLER")) {
    return NextResponse.json({ error: "Нет доступа" }, { status: 403 });
  }

  const { id } = await params;
  await prisma.attributeType.delete({ where: { id } });

  return NextResponse.json({ success: true });
}