import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";

export async function PUT(req: Request) {
  const session = await auth();
  if (!session || ((session.user as any)?.role !== "ADMIN" && (session.user as any)?.role !== "SELLER")) {
    return NextResponse.json({ error: "Нет доступа" }, { status: 403 });
  }

  try {
    const { items } = await req.json(); // Массив объектов [{ id, sortOrder }]

    // Обновляем каждую запись в транзакции
    await prisma.$transaction(
      items.map((item: any) => 
        prisma.repairService.update({
          where: { id: item.id },
          data: { sortOrder: item.sortOrder },
        })
      )
    );

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Ошибка сортировки:", error);
    return NextResponse.json({ error: "Ошибка сервера" }, { status: 500 });
  }
}