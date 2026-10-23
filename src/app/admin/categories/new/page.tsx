import { Suspense } from "react";
import { prisma } from "@/lib/prisma";
import CategoryForm from "./CategoryForm";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

async function CategoryWrapper({ searchParamsPromise }: { searchParamsPromise: Promise<{ parent?: string }> }) {
  const searchParams = await searchParamsPromise;
  const parentId = searchParams.parent;
  
  // Получаем все категории для выпадающего списка (если это главная категория)
  const categories = await prisma.category.findMany({
    orderBy: { name: 'asc' }
  });

  // Если передан parentId, узнаем имя родителя для красивого заголовка
  let parentName = "";
  if (parentId) {
    const parent = await prisma.category.findUnique({ where: { id: parentId } });
    if (parent) parentName = parent.name;
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-8">
        <Link href={parentId ? `/admin/categories/${parentId}` : "/admin/categories"} className="text-blue-500 text-sm flex items-center gap-1 mb-2 hover:underline">
          <ArrowLeft size={16} /> Назад к категориям
        </Link>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
          {parentId ? `Новая подгруппа в "${parentName}"` : "Новая главная категория"}
        </h1>
        <p className="text-gray-500 mt-2">Создайте группу для структуры каталога.</p>
      </div>
      
      <CategoryForm categories={categories} parentId={parentId} />
    </div>
  );
}

export default function NewCategoryPage({ searchParams }: { searchParams: Promise<{ parent?: string }> }) {
  return (
    <Suspense fallback={<div className="p-8 text-center text-gray-500">Загрузка данных...</div>}>
      <CategoryWrapper searchParamsPromise={searchParams} />
    </Suspense>
  );
}