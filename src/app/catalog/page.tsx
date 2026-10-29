import { Suspense } from "react";
import { prisma } from "@/lib/prisma";
import Header from "@/components/Header";
import CatalogClient from "./CatalogClient";

// Вспомогательная функция: собирает ID категории и ВСЕХ её вложенных подкатегорий
function getAllCategoryIds(categoryId: string, allCategories: any[]): string[] {
  let ids = [categoryId];
  const children = allCategories.filter(c => c.parentId === categoryId);
  
  for (const child of children) {
    ids = [...ids, ...getAllCategoryIds(child.id, allCategories)];
  }
  return ids;
}

async function CatalogData({ searchParamsPromise }: { searchParamsPromise: Promise<any> }) {
  const searchParams = await searchParamsPromise;
  
  // Достаем все параметры из URL
  const categoryId = searchParams.category;
  const minPrice = searchParams.minPrice ? Number(searchParams.minPrice) * 100 : undefined;
  const maxPrice = searchParams.maxPrice ? Number(searchParams.maxPrice) * 100 : undefined;
  const availability = searchParams.availability; 
  const sort = searchParams.sort || "new"; 

  const categories = await prisma.category.findMany();

  // 1. СБОРКА ФИЛЬТРОВ (where)
  let whereCondition: any = {};

  if (categoryId) {
    const validIds = getAllCategoryIds(categoryId, categories);
    whereCondition.categoryId = { in: validIds };
  }

  if (minPrice || maxPrice) {
    whereCondition.priceCash = {};
    if (minPrice) whereCondition.priceCash.gte = minPrice;
    if (maxPrice) whereCondition.priceCash.lte = maxPrice;
  }

  if (availability) {
    if (availability === "in_stock") {
      whereCondition.availability = { in: ["BOTH", "ANGARSK", "IRKUTSK"] };
    } else {
      whereCondition.availability = availability;
    }
  }

  // 2. СОРТИРОВКА (orderBy)
  let orderByCondition: any = { createdAt: "desc" }; 

  if (sort === "price_asc") orderByCondition = { priceCash: "asc" };
  if (sort === "price_desc") orderByCondition = { priceCash: "desc" };
  if (sort === "name_asc") orderByCondition = { name: "asc" };
  if (sort === "name_desc") orderByCondition = { name: "desc" };
  if (sort === "popular") {
    // ИСПРАВЛЕНО: bookings заменено на bookingItems
    orderByCondition = { bookingItems: { _count: "desc" } };
  }

  // 3. ЗАПРОС В БАЗУ
  const products = await prisma.product.findMany({
    where: whereCondition,
    orderBy: orderByCondition,
    include: {
      _count: {
        // ИСПРАВЛЕНО: bookings заменено на bookingItems
        select: { bookingItems: true } 
      }
    }
  });

  // Название категории для заголовка
  let activeCategoryName = "Все товары";
  if (categoryId) {
    const currentCategory = categories.find(c => c.id === categoryId);
    if (currentCategory) activeCategoryName = currentCategory.name;
  }

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          {activeCategoryName}
        </h1>
        <p className="text-sm text-gray-500 mt-1">Найдено товаров: {products.length}</p>
      </div>

      <CatalogClient initialProducts={products} categories={categories} />
    </div>
  );
}

export default function CatalogPage({ searchParams }: { searchParams: Promise<any> }) {
  return (
    <main className="min-h-screen relative overflow-hidden p-4 pb-20">
      <div className="fixed top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-500 rounded-full mix-blend-multiply dark:mix-blend-screen filter blur-[100px] opacity-30 dark:opacity-20"></div>
      <div className="fixed top-[20%] right-[-10%] w-[30%] h-[50%] bg-purple-500 rounded-full mix-blend-multiply dark:mix-blend-screen filter blur-[100px] opacity-30 dark:opacity-20"></div>
      
      <div className="relative z-10">
        <Header />
        <div className="max-w-7xl mx-auto mt-8">
          <Suspense fallback={<div className="text-center text-gray-500 py-20">Загрузка каталога...</div>}>
             <CatalogData searchParamsPromise={searchParams} />
          </Suspense>
        </div>
      </div>
    </main>
  );
}