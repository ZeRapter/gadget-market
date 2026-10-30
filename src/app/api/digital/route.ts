import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";

export async function POST(req: Request) {
  try {
    const session = await auth();
    const body = await req.json();
    
    const { gameTitle, console, region, accountStatus, contactMethod, contactValue, guestName, guestPhone } = body;

    if (!gameTitle || !console || !region || !contactMethod || !guestName || !guestPhone) {
      return NextResponse.json({ error: "Заполните все обязательные поля" }, { status: 400 });
    }

    if (contactMethod === "vk" && (!contactValue || !contactValue.trim())) {
      return NextResponse.json({ error: "Для связи во ВКонтакте укажите ссылку или ID" }, { status: 400 });
    }

    if ((contactMethod === "telegram" || contactMethod === "max") && (!contactValue || !contactValue.trim())) {
      return NextResponse.json({ error: "Укажите контакт для связи" }, { status: 400 });
    }

    const digitalReq = await prisma.digitalRequest.create({
      data: {
        userId: session?.user ? (session.user as any).id : null,
        gameTitle,
        console,
        region,
        accountStatus,
        contactMethod,
        contactValue,
        guestName,
        guestPhone,
      },
    });

    return NextResponse.json({ success: true, id: digitalReq.id });
  } catch (error) {
    console.error("Ошибка создания заявки:", error);
    return NextResponse.json({ error: "Ошибка сервера" }, { status: 500 });
  }
}