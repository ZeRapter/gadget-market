import { Suspense } from "react";
import { prisma } from "@/lib/prisma";
import ProductForm from "./ProductForm";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

async function FormWrapper({ searchParamsPromise }: { searchParamsPromise: Promise<{ category?: string }> }) {
  const searchParams = await searchParamsPromise;
  const preselectedCategoryId = searchParams.category;

  const categories = await prisma.category.findMany();
  
  // Если мы пришли из категории, узнаем её имя для заголовка
  let categoryName = "";
  if (preselectedCategoryId) {
    const cat = await prisma.category.findUnique({ where: { id: preselectedCategoryId } });
    if (cat) categoryName = cat.name;
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-8">
        <Link 
          href={preselectedCategoryId ? `/admin/categories/${preselectedCategoryId}` : "/admin/products"} 
          className="text-blue-500 text-sm flex items-center gap-1 mb-2 hover:underline"
        >
          <ArrowLeft size={16} /> Назад
        </Link>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
          Добавить товар {categoryName ? `в "${categoryName}"` : ""}
        </h1>
        <p className="text-gray-500 mt-2">Заполните информацию о товаре для каталога.</p>
      </div>
      
      <ProductForm categories={categories} initialCategoryId={preselectedCategoryId} />
    </div>
  );
}

export default function NewProductPage({ searchParams }: { searchParams: Promise<{ category?: string }> }) {
  return (
    <Suspense fallback={<div className="p-8 text-center text-gray-500">Загрузка формы...</div>}>
      <FormWrapper searchParamsPromise={searchParams} />
    </Suspense>
  );
}