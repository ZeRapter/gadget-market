import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const plans = await prisma.subscriptionPlan.findMany({
      orderBy: { sortOrder: "asc" },
    });
    return NextResponse.json(plans);
  } catch (error) {
    return NextResponse.json({ error: "Ошибка получения цен" }, { status: 500 });
  }
}