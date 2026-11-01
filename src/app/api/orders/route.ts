import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import { sendTelegramNotification } from "@/lib/telegram";

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
        guestEmail: guestEmail || null,
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

    try {
      const clientName = session?.user?.name || guestName || "Гость";
      const itemsList = items.map((item: any) => `• ${item.name || "Товар"} — ${item.quantity} шт.`).join("\n");
      const totalSum = items.reduce((sum: number, item: any) => sum + (item.priceCash * item.quantity), 0);

      // Изменили # на №
      await sendTelegramNotification(
        `📦 <b>Новый заказ №${order.orderNumber}!</b>\n\n` +
        `👤 <b>Клиент:</b> ${clientName}\n` +
        `📞 <b>Телефон:</b> ${guestPhone || "Не указан"}\n` +
        `🚚 <b>Доставка:</b> ${deliveryService}\n` +
        `📍 <b>Адрес:</b> ${address || "Не указан"}\n` +
        `💬 <b>Связь:</b> ${contactMethod.toUpperCase()}: ${finalContactValue || "—"}\n\n` +
        `🛒 <b>Товары:</b>\n${itemsList}\n\n` +
        `💰 <b>Итого (нал.):</b> ${(totalSum / 100).toLocaleString('ru-RU')} ₽\n` +
        `📝 <b>Комментарий:</b> ${comment || "—"}`
      );
    } catch (tgError) {
      console.error("Ошибка отправки уведомления в Telegram (заказ создан):", tgError);
    }

    return NextResponse.json({ success: true, orderId: order.id, orderNumber: order.orderNumber });
  } catch (error) {
    console.error("Ошибка создания заказа:", error);
    return NextResponse.json({ error: "Ошибка сервера при создании заказа" }, { status: 500 });
  }
}