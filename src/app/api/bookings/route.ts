import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import { sendTelegramNotification } from "@/lib/telegram";

export async function POST(req: Request) {
  try {
    const session = await auth();
    const body = await req.json();
    
    const { productId, branch, comment, guestName, guestPhone, contactMethod, contactValue } = body;

    if (!productId || !branch) {
      return NextResponse.json({ error: "Выберите филиал" }, { status: 400 });
    }

    const finalContactValue = contactMethod === "phone" ? guestPhone : contactValue;
    if (contactMethod === "vk" && (!finalContactValue || !finalContactValue.trim())) {
      return NextResponse.json({ error: "Для связи во ВКонтакте укажите ссылку или ID" }, { status: 400 });
    }

    if (!session && (!guestName || !guestPhone)) {
      return NextResponse.json({ error: "Укажите ваше имя и телефон" }, { status: 400 });
    }

    const product = await prisma.product.findUnique({ where: { id: productId } });
    if (!product) return NextResponse.json({ error: "Товар не найден" }, { status: 404 });

    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + product.maxBookingHours);

    const pickupCode = Math.floor(100000 + Math.random() * 900000).toString();

    const booking = await prisma.booking.create({
      data: {
        userId: session?.user ? (session.user as any).id : null,
        branch: branch,
        comment: comment || "",
        expiresAt: expiresAt,
        status: "PENDING",
        pickupCode: pickupCode,
        guestName: session ? null : guestName,
        guestPhone: guestPhone || null,
        contactMethod: contactMethod,
        contactValue: finalContactValue || null,
        items: {
          create: [{ productId: productId, quantity: 1 }]
        }
      },
    });

    const clientName = session?.user?.name || guestName || "Гость";
    const branchName = branch === "ANGARSK" ? "Ангарск" : "Иркутск";
    
    // Изменили # на №
    await sendTelegramNotification(
      `🛒 <b>Новая бронь №${booking.bookingNumber}!</b>\n\n` +
      `📦 <b>Товар:</b> ${product.name}\n` +
      `👤 <b>Клиент:</b> ${clientName}\n` +
      `📞 <b>Телефон:</b> ${guestPhone || "Не указан"}\n` +
      `🏢 <b>Филиал:</b> ${branchName}\n` +
      `💬 <b>Связь:</b> ${contactMethod.toUpperCase()}: ${finalContactValue || "—"}\n` +
      `🔑 <b>Код выдачи:</b> <code>${pickupCode}</code>\n` +
      `📝 <b>Комментарий:</b> ${comment || "—"}`
    );

    return NextResponse.json({ success: true, bookingId: booking.id, bookingNumber: booking.bookingNumber, pickupCode: booking.pickupCode });
  } catch (error) {
    console.error("Ошибка создания брони:", error);
    return NextResponse.json({ error: "Ошибка сервера при создании брони" }, { status: 500 });
  }
}