import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";

export async function POST(req: Request) {
  const session = await auth();
  if (!session || ((session.user as any)?.role !== "ADMIN" && (session.user as any)?.role !== "SELLER")) {
    return NextResponse.json({ error: "Нет доступа" }, { status: 403 });
  }

  const { value, attributeTypeId } = await req.json();

  if (!value || !attributeTypeId) {
    return NextResponse.json({ error: "Не хватает данных" }, { status: 400 });
  }

  try {
    const maxSort = await prisma.attributeValue.aggregate({
      where: { attributeTypeId },
      _max: { sortOrder: true },
    });
    const nextSort = (maxSort._max.sortOrder || 0) + 1;

    const newValue = await prisma.attributeValue.create({
      data: {
        value,
        attributeTypeId,
        sortOrder: nextSort,
      },
    });
    return NextResponse.json(newValue);
  } catch (error) {
    return NextResponse.json({ error: "Ошибка при сохранении значения" }, { status: 400 });
  }
}

// НОВЫЙ МЕТОД ДЛЯ РЕДАКТИРОВАНИЯ
export async function PUT(req: Request) {
  const session = await auth();
  if (!session || ((session.user as any)?.role !== "ADMIN" && (session.user as any)?.role !== "SELLER")) {
    return NextResponse.json({ error: "Нет доступа" }, { status: 403 });
  }

  const { id, value } = await req.json();

  if (!id || !value) {
    return NextResponse.json({ error: "Не хватает данных" }, { status: 400 });
  }

  try {
    const updated = await prisma.attributeValue.update({
      where: { id },
      data: { value },
    });
    return NextResponse.json(updated);
  } catch (error) {
    return NextResponse.json({ error: "Ошибка при обновлении значения" }, { status: 400 });
  }
}

export async function DELETE(req: Request) {
  const session = await auth();
  if (!session || ((session.user as any)?.role !== "ADMIN" && (session.user as any)?.role !== "SELLER")) {
    return NextResponse.json({ error: "Нет доступа" }, { status: 403 });
  }

  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");
  if (!id) return NextResponse.json({ error: "Нет ID" }, { status: 400 });

  await prisma.attributeValue.delete({ where: { id } });
  return NextResponse.json({ success: true });
}