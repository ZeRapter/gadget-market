import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";

// Обновление (переименование)
export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await auth();
    if (!session || ((session.user as any)?.role !== "ADMIN" && (session.user as any)?.role !== "SELLER")) {
      return NextResponse.json({ error: "Доступ запрещен" }, { status: 403 });
    }

    const { id } = await params;
    const { name } = await req.json();

    if (!name || !name.trim()) {
      return NextResponse.json({ error: "Название не может быть пустым" }, { status: 400 });
    }

    const updated = await prisma.category.update({
      where: { id },
      data: { name },
    });

    return NextResponse.json(updated);
  } catch (error) {
    console.error("Ошибка обновления категории:", error);
    return NextResponse.json({ error: "Ошибка при обновлении" }, { status: 500 });
  }
}

// Удаление
export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await auth();
    if (!session || ((session.user as any)?.role !== "ADMIN" && (session.user as any)?.role !== "SELLER")) {
      return NextResponse.json({ error: "Доступ запрещен" }, { status: 403 });
    }

    const { id } = await params;

    // Пытаемся удалить. Если внутри есть товары или подкатегории, Prisma выдаст ошибку.
    await prisma.category.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Ошибка удаления категории:", error);
    
    // Обработка ошибки внешнего ключа (когда есть вложенные данные)
    if (error.code === "P2003") {
      return NextResponse.json(
        { error: "Нельзя удалить категорию, пока в ней есть товары или подкатегории. Сначала удалите или перенесите их." }, 
        { status: 400 }
      );
    }
    
    return NextResponse.json({ error: "Ошибка при удалении" }, { status: 500 });
  }
}