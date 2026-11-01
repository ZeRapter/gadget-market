import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";

export async function POST(req: Request) {
  const session = await auth();
  if (!session || ((session.user as any)?.role !== "ADMIN" && (session.user as any)?.role !== "SELLER")) {
    return NextResponse.json({ error: "Нет доступа" }, { status: 403 });
  }

  try {
    const allCategories = await prisma.category.findMany();

    // Получаем полный путь категории
    const getPath = (catId: string): string[] => {
      const path = [];
      let current = allCategories.find(c => c.id === catId);
      while (current) {
        path.push(current.name.toLowerCase());
        if (current.parentId) {
          const parentId = current.parentId;
          current = allCategories.find(c => c.id === parentId);
        } else {
          current = undefined;
        }
      }
      return path;
    };

    // Генерация кодов
    const ps4Regions = ["00", "01", "02", "03", "04", "05", "06", "07", "08", "09", "11", "12", "14", "15", "16"];
    const ps5Regions = ["00", "02", "08", "09", "14", "15", "16", "18", "19", "20", "21", "22"];

    const generateCodes = (revisions: string[], regions: string[], prefix: string) => {
      const codes: string[] = [];
      revisions.forEach(rev => {
        regions.forEach(reg => {
          codes.push(`${prefix}-${rev}${reg}A`);
          codes.push(`${prefix}-${rev}${reg}B`);
        });
      });
      return codes;
    };

    const baseAttributes = [
      {
        name: "Код PS4 Fat",
        match: (path: string[]) => path.some(p => p.includes("ps4 fat") || p.includes("playstation 4 fat")),
        values: generateCodes(["1000", "1100", "1200"], ps4Regions, "CUH")
      },
      {
        name: "Код PS4 Slim",
        match: (path: string[]) => path.some(p => p.includes("ps4 slim") || p.includes("playstation 4 slim")),
        values: generateCodes(["2000", "2100", "2200"], ps4Regions, "CUH")
      },
      {
        name: "Код PS4 Pro",
        match: (path: string[]) => path.some(p => p.includes("ps4 pro") || p.includes("playstation 4 pro")),
        values: generateCodes(["7000", "7100", "7200"], ps4Regions, "CUH")
      },
      {
        name: "Код PS5 Fat",
        match: (path: string[]) => path.some(p => p.includes("ps5 fat") || p.includes("playstation 5 fat") || p.includes("ps5") && !p.includes("slim") && !p.includes("pro")),
        values: generateCodes(["1000", "1100", "1200"], ps5Regions, "CFI")
      },
      {
        name: "Код PS5 Slim",
        match: (path: string[]) => path.some(p => p.includes("ps5 slim") || p.includes("playstation 5 slim")),
        values: generateCodes(["2000", "2100"], ps5Regions, "CFI")
      },
      {
        name: "Код PS5 Pro",
        match: (path: string[]) => path.some(p => p.includes("ps5 pro") || p.includes("playstation 5 pro")),
        values: generateCodes(["7000", "7100"], ps5Regions, "CFI")
      }
    ];

    for (const attr of baseAttributes) {
      const existingType = await prisma.attributeType.findUnique({ where: { name: attr.name } });
      let typeId = "";

      if (existingType) {
        typeId = existingType.id;
      } else {
        const validCategoryIds = allCategories.filter(c => attr.match(getPath(c.id))).map(c => c.id);
        const newType = await prisma.attributeType.create({
          data: { name: attr.name, categories: { connect: validCategoryIds.map(id => ({ id })) } }
        });
        typeId = newType.id;
      }

      // Загружаем все существующие значения для этого типа, чтобы не дублировать
      const existingValues = await prisma.attributeValue.findMany({
        where: { attributeTypeId: typeId },
        select: { value: true }
      });
      const existingSet = new Set(existingValues.map(v => v.value));

      for (let i = 0; i < attr.values.length; i++) {
        const val = attr.values[i];
        if (!existingSet.has(val)) {
          await prisma.attributeValue.create({
            data: { value: val, attributeTypeId: typeId, sortOrder: i + 100 }
          });
        }
      }
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Ошибка при заполнении" }, { status: 500 });
  }
}