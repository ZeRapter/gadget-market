import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await auth();
    // Менять роли может только Администратор
    if (!session || (session.user as any)?.role !== "ADMIN") {
      return NextResponse.json({ error: "Доступ запрещен. Только для Администратора." }, { status: 403 });
    }

    const { id } = await params;
    const { role, status } = await req.json();

    const updatedUser = await prisma.user.update({
      where: { id },
      data: { 
        role,
        status 
      },
    });

    return NextResponse.json(updatedUser);
  } catch (error) {
    console.error("Ошибка обновления пользователя:", error);
    return NextResponse.json({ error: "Ошибка обновления" }, { status: 500 });
  }
}