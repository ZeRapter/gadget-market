import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";

export async function GET() {
  const session = await auth();
  if (!session || ((session.user as any)?.role !== "ADMIN" && (session.user as any)?.role !== "SELLER")) {
    return NextResponse.json({ error: "Нет доступа" }, { status: 403 });
  }

  const types = await prisma.attributeType.findMany({
    include: {
      categories: { select: { id: true, name: true } },
      values: { orderBy: { sortOrder: "asc" } },
    },
    orderBy: { name: "asc" },
  });

  return NextResponse.json(types);
}

export async function POST(req: Request) {
  const session = await auth();
  if (!session || ((session.user as any)?.role !== "ADMIN" && (session.user as any)?.role !== "SELLER")) {
    return NextResponse.json({ error: "Нет доступа" }, { status: 403 });
  }

  const { name, categoryIds } = await req.json();

  if (!name) return NextResponse.json({ error: "Введите название типа" }, { status: 400 });

  try {
    const type = await prisma.attributeType.create({
      data: {
        name,
        categories: categoryIds?.length
          ? { connect: categoryIds.map((id: string) => ({ id })) }
          : undefined, 
      },
      include: { categories: true },
    });
    return NextResponse.json(type);
  } catch (error) {
    return NextResponse.json({ error: "Такой тип уже существует" }, { status: 400 });
  }
}