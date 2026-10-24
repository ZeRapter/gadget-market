import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";

export async function PUT(req: Request) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Доступ запрещен" }, { status: 403 });
    }

    const { name, phone } = await req.json();
    const userId = (session.user as any).id;

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: { name, phone },
    });

    return NextResponse.json({ success: true, user: updatedUser });
  } catch (error) {
    console.error("Ошибка обновления профиля:", error);
    return NextResponse.json({ error: "Ошибка при обновлении" }, { status: 500 });
  }
}