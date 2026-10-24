import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";

export async function POST(req: Request) {
  try {
    const session = await auth();
    const body = await req.json();
    
    const { items, deliveryService, address, comment, guestName, guestPhone, guestEmail, contactMethod, contactValue } = body;

    if (!items || items.length === 0) return NextResponse.json({ error: "Корзина пуста" }, { status: 400 });
    if (!deliveryService) return NextResponse.json({ error: "Выберите службу доставки" }, { status: 400 });

    if (!session && (!guestName || !guestPhone)) {
      return NextResponse.json({ error: "Укажите ваше имя и телефон" }, { status: 400 });
    }

    const finalContactValue = contactMethod === "phone" ? guestPhone : contactValue;
    if (contactMethod === "vk" && (!finalContactValue || !finalContactValue.trim())) {
      return NextResponse.json({ error: "Для связи во ВКонтакте укажите ссылку или ID" }, { status: 400 });
    }

    const userId = session?.user ? (session.user as any).id : null;

    const order = await prisma.order.create({
      data: {
        userId: userId,
        deliveryService: deliveryService,
        address: address || "",
        comment: comment || "",
        status: "PENDING",
        guestName: session ? null : guestName,
        guestPhone: guestPhone || null, 
        guestEmail: guestEmail || null, // Сохраняем почту
        contactMethod: contactMethod,
        contactValue: finalContactValue || null,
        items: {
          create: items.map((item: any) => ({
            productId: item.id,
            price: item.priceCash,
            quantity: item.quantity,
          })),
        },
      },
    });

    return NextResponse.json({ success: true, orderId: order.id });
  } catch (error) {
    console.error("Ошибка создания заказа:", error);
    return NextResponse.json({ error: "Ошибка сервера при создании заказа" }, { status: 500 });
  }
}