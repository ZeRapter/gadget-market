import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";

export async function GET() {
  const session = await auth();
  if (!session || ((session.user as any)?.role !== "ADMIN" && (session.user as any)?.role !== "SELLER")) {
    return NextResponse.json({ error: "Нет доступа" }, { status: 403 });
  }

  const promocodes = await prisma.promoCode.findMany({
    orderBy: { createdAt: "desc" },
  });
  return NextResponse.json(promocodes);
}

export async function POST(req: Request) {
  const session = await auth();
  if (!session || ((session.user as any)?.role !== "ADMIN" && (session.user as any)?.role !== "SELLER")) {
    return NextResponse.json({ error: "Нет доступа" }, { status: 403 });
  }

  const { code, discountPct, discountAmt, expiresAt } = await req.json();

  if (!code) return NextResponse.json({ error: "Введите код" }, { status: 400 });
  if (!discountPct && !discountAmt) return NextResponse.json({ error: "Укажите скидку" }, { status: 400 });

  try {
    const promo = await prisma.promoCode.create({
      data: {
        code: code.toUpperCase(),
        discountPct: discountPct ? Number(discountPct) : null,
        discountAmt: discountAmt ? Number(discountAmt) : null,
        expiresAt: expiresAt ? new Date(expiresAt) : null,
      },
    });
    return NextResponse.json(promo);
  } catch (error) {
    return NextResponse.json({ error: "Такой код уже существует" }, { status: 400 });
  }
}