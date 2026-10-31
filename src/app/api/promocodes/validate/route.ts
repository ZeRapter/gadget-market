import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const { code } = await req.json();

    if (!code) {
      return NextResponse.json({ error: "Введите промокод" }, { status: 400 });
    }

    const promo = await prisma.promoCode.findUnique({
      where: { code: code.toUpperCase() },
    });

    if (!promo) {
      return NextResponse.json({ error: "Промокод не найден" }, { status: 404 });
    }

    if (!promo.isActive) {
      return NextResponse.json({ error: "Промокод больше не действует" }, { status: 400 });
    }

    if (promo.expiresAt && new Date(promo.expiresAt) < new Date()) {
      return NextResponse.json({ error: "Срок действия промокода истек" }, { status: 400 });
    }

    return NextResponse.json(promo);
  } catch (error) {
    return NextResponse.json({ error: "Ошибка сервера" }, { status: 500 });
  }
}