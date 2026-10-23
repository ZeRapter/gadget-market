import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";

export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session || ((session.user as any)?.role !== "ADMIN" && (session.user as any)?.role !== "SELLER")) {
      return NextResponse.json({ error: "Доступ запрещен" }, { status: 403 });
    }

    const { name, parentId } = await req.json();

    // Генерируем slug (например, "Игровые приставки" -> "igrovye-pristavki")
    // Простой транслит для русских букв
    const translitMap: Record<string, string> = {
      'а':'a','б':'b','в':'v','г':'g','д':'d','е':'e','ё':'yo','ж':'zh','з':'z','и':'i','й':'y','к':'k','л':'l','м':'m','н':'n','о':'o','п':'p','р':'r','с':'s','т':'t','у':'u','ф':'f','х':'h','ц':'ts','ч':'ch','ш':'sh','щ':'sch','ъ':'','ы':'y','ь':'','э':'e','ю':'yu','я':'ya'
    };
    const slug = name.toLowerCase().split('').map((char: string) => translitMap[char] || char).join('').replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

    const category = await prisma.category.create({
      data: {
        name,
        slug: slug + "-" + Date.now().toString().slice(-4), // Добавляем кусочек времени, чтобы слаги не повторялись
        parentId: parentId ? parentId : null,
      },
    });

    return NextResponse.json(category, { status: 201 });
  } catch (error) {
    console.error("Ошибка создания категории:", error);
    return NextResponse.json({ error: "Ошибка сервера" }, { status: 500 });
  }
}