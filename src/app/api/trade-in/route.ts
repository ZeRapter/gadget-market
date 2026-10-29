import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";

export async function POST(req: Request) {
  try {
    const session = await auth();
    const body = await req.json();
    
    const { deviceToTrade, condition, completeness, desiredDevice, contactMethod, contactValue, contactPhone, guestName, guestPhone } = body;

    if (!deviceToTrade || !condition || !contactMethod || !guestName || !guestPhone) {
      return NextResponse.json({ error: "Заполните все обязательные поля (включая имя и телефон)" }, { status: 400 });
    }

    if (contactMethod === "vk" && (!contactValue || !contactValue.trim())) {
      return NextResponse.json({ error: "Для связи во ВКонтакте укажите ссылку или ID" }, { status: 400 });
    }

    if (contactMethod === "telegram" && (!contactValue?.trim() && !contactPhone?.trim())) {
      return NextResponse.json({ error: "Укажите хотя бы один контакт для Telegram (никнейм или телефон)" }, { status: 400 });
    }

    if (contactMethod === "max" && !contactPhone?.trim()) {
      return NextResponse.json({ error: "Для связи в Max обязательно укажите номер телефона" }, { status: 400 });
    }

    const finalContactValue = [contactValue, contactPhone].filter(Boolean).join(" / ");

    const tradeIn = await prisma.tradeInRequest.create({
      data: {
        userId: session?.user ? (session.user as any).id : null,
        deviceToTrade,
        condition,
        completeness: completeness || null,
        desiredDevice: desiredDevice || null,
        contactMethod,
        contactValue: finalContactValue || null, 
        guestName,  // <--- Сохраняем имя
        guestPhone, // <--- Сохраняем телефон
      },
    });

    return NextResponse.json({ success: true, id: tradeIn.id });
  } catch (error) {
    console.error("Ошибка создания Trade-in:", error);
    return NextResponse.json({ error: "Ошибка сервера" }, { status: 500 });
  }
}