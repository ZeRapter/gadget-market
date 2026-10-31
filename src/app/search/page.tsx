import { Suspense } from "react";
import Header from "@/components/Header";
import ProductCard from "@/components/ProductCard";
import { prisma } from "@/lib/prisma";
import { Search } from "lucide-react";

async function SearchResults({ searchParamsPromise }: { searchParamsPromise: Promise<{ q?: string }> }) {
  const searchParams = await searchParamsPromise;
  const query = searchParams.q || "";

  if (!query) {
    return (
      <div className="text-center py-20">
        <h2 className="text-2xl font-bold dark:text-white mb-2">Введите запрос</h2>
        <p className="text-gray-500">Начните вводить название товара или артикул в строке поиска.</p>
      </div>
    );
  }

  const products = await prisma.product.findMany({
    where: {
      OR: [
        { name: { contains: query, mode: "insensitive" } },
        { sku: { contains: query, mode: "insensitive" } },
      ],
    },
    orderBy: { createdAt: "desc" },
  });

  if (products.length === 0) {
    return (
      <div className="glass-panel p-12 text-center rounded-3xl flex flex-col items-center">
        <Search size={48} className="text-gray-300 dark:text-gray-600 mb-4" />
        <h2 className="text-2xl font-bold dark:text-white mb-2">Ничего не найдено</h2>
        <p className="text-gray-500 dark:text-gray-400">По запросу «{query}» ничего не найдено. Попробуйте изменить запрос.</p>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          Результаты поиска: <span className="text-blue-500">«{query}»</span>
        </h1>
        <p className="text-sm text-gray-500 mt-1">Найдено товаров: {products.length}</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-6">
        {products.map((product) => (
          <ProductCard
            key={product.id}
            id={product.id}
            title={product.name}
            priceCash={product.priceCash}
            priceCard={product.priceCard}
            imageUrl={product.images?.[0]}
            availability={
              product.availability === "BOTH" ? "В наличии" :
              product.availability === "ANGARSK" ? "В Ангарске" :
              product.availability === "IRKUTSK" ? "В Иркутске" :
              product.availability === "ON_ORDER" ? "Под заказ" : 
              "Нет в наличии"
            }
          />
        ))}
      </div>
    </div>
  );
}

export default function SearchPage({ searchParams }: { searchParams: Promise<{ q?: string }> }) {
  return (
    <main className="min-h-screen relative overflow-hidden p-4 pb-20">
      <div className="fixed top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-500 rounded-full mix-blend-multiply dark:mix-blend-screen filter blur-[100px] opacity-30 dark:opacity-20"></div>
      <div className="fixed top-[20%] right-[-10%] w-[30%] h-[50%] bg-purple-500 rounded-full mix-blend-multiply dark:mix-blend-screen filter blur-[100px] opacity-30 dark:opacity-20"></div>
      
      <div className="relative z-10">
        <Header />
        <div className="max-w-7xl mx-auto mt-8">
          <Suspense fallback={<div className="text-center text-gray-500 py-20">Поиск...</div>}>
            <SearchResults searchParamsPromise={searchParams} />
          </Suspense>
        </div>
      </div>
    </main>
  );
}