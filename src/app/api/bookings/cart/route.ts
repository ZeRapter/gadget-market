import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";

export async function POST(req: Request) {
  try {
    const session = await auth();
    const body = await req.json();
    
    const { items, branch, comment, guestName, guestPhone, guestEmail, contactMethod, contactValue } = body;

    if (!items || items.length === 0) return NextResponse.json({ error: "Корзина пуста" }, { status: 400 });
    if (!branch) return NextResponse.json({ error: "Выберите филиал" }, { status: 400 });

    const finalContactValue = contactMethod === "phone" ? guestPhone : contactValue;
    if (contactMethod === "vk" && (!finalContactValue || !finalContactValue.trim())) {
      return NextResponse.json({ error: "Для связи во ВКонтакте укажите ссылку или ID" }, { status: 400 });
    }

    let finalUserId = session?.user ? (session.user as any).id : null;

    if (!session && (!guestName || !guestPhone)) {
      return NextResponse.json({ error: "Укажите ваше имя и телефон" }, { status: 400 });
    }

    const firstProduct = await prisma.product.findUnique({ where: { id: items[0].id } });
    const maxHours = firstProduct?.maxBookingHours || 24;
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + maxHours);

    // ГЕНЕРИРУЕМ КОД ДЛЯ БРОНИ
    const pickupCode = Math.floor(100000 + Math.random() * 900000).toString();

    const booking = await prisma.booking.create({
      data: {
        userId: finalUserId,
        branch: branch,
        comment: comment || "",
        expiresAt: expiresAt,
        status: "PENDING",
        pickupCode: pickupCode, // Код выдачи
        guestName: session ? null : guestName,
        guestPhone: guestPhone || null,
        guestEmail: guestEmail || null, // Сохраняем почту
        contactMethod: contactMethod,
        contactValue: finalContactValue || null,
        items: {
          create: items.map((item: any) => ({
            productId: item.id,
            quantity: item.quantity,
          })),
        },
      },
    });

    return NextResponse.json({ success: true, bookingId: booking.id });
  } catch (error) {
    console.error("Ошибка создания брони корзины:", error);
    return NextResponse.json({ error: "Ошибка сервера" }, { status: 500 });
  }
}