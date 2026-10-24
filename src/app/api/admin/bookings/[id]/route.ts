import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await auth();
    if (!session || ((session.user as any)?.role !== "ADMIN" && (session.user as any)?.role !== "SELLER")) {
      return NextResponse.json({ error: "Доступ запрещен" }, { status: 403 });
    }

    const { id } = await params;
    const { status, cancelReason } = await req.json();

    const updatedBooking = await prisma.booking.update({
      where: { id },
      data: { status, cancelReason: cancelReason || null },
    });

    return NextResponse.json(updatedBooking);
  } catch (error) {
    return NextResponse.json({ error: "Ошибка обновления" }, { status: 500 });
  }
}