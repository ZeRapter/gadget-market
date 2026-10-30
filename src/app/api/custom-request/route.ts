import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";

export async function POST(req: Request) {
  try {
    const session = await auth();
    const body = await req.json();
    
    // Убрали productLink
    const { productName, comment, guestName, guestPhone, contactMethod, contactValue } = body;

    if (!productName || !contactMethod || !guestName || !guestPhone) {
      return NextResponse.json({ error: "Заполните все обязательные поля" }, { status: 400 });
    }

    const customReq = await prisma.customRequest.create({
      data: {
        userId: session?.user ? (session.user as any).id : null,
        productName,
        productLink: null, // Оставляем null в базе
        comment: comment || null,
        guestName,
        guestPhone,
        contactMethod,
        contactValue: contactValue || null,
      },
    });

    return NextResponse.json({ success: true, id: customReq.id });
  } catch (error) {
    console.error("Ошибка создания заявки под заказ:", error);
    return NextResponse.json({ error: "Ошибка сервера" }, { status: 500 });
  }
}