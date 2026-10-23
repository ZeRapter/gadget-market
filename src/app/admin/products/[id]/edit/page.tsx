import { Suspense } from "react";
import { prisma } from "@/lib/prisma";
import ProductForm from "../../new/ProductForm";
import { notFound } from "next/navigation";

// Теперь мы принимаем params (обещание) прямо здесь и ждем его внутри Suspense
async function EditFormWrapper({ paramsPromise }: { paramsPromise: Promise<{ id: string }> }) {
  // 1. Достаем ID внутри компонента, который уже обернут в Suspense
  const { id } = await paramsPromise;

  const product = await prisma.product.findUnique({
    where: { id },
  });

  if (!product) notFound();

  const categories = await prisma.category.findMany();

  return <ProductForm categories={categories} initialData={product} />;
}

// Сама страница теперь синхронная (без async)
export default function EditProductPage({ params }: { params: Promise<{ id: string }> }) {
  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Редактировать товар</h1>
        <p className="text-gray-500 mt-2">Измените нужные поля и сохраните изменения.</p>
      </div>
      
      <Suspense fallback={<div className="p-8 text-center text-gray-500">Загрузка данных товара...</div>}>
        {/* Передаем обещание params внутрь */}
        <EditFormWrapper paramsPromise={params} />
      </Suspense>
    </div>
  );
}