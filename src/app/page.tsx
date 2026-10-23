import { Suspense } from "react";
import Header from "@/components/Header";
import ProductCard from "@/components/ProductCard";
import { prisma } from "@/lib/prisma";

async function ProductList() {
  const products = await prisma.product.findMany({
    take: 4,
    orderBy: { createdAt: "desc" },
  });

  if (products.length === 0) {
    return (
      <div className="glass-panel p-8 text-center rounded-2xl">
        <p className="text-gray-500">Товаров пока нет. Добавьте их через админку.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
      {products.map((product) => (
        <ProductCard
          key={product.id}
          title={product.name}
          priceCash={product.priceCash}
          priceCard={product.priceCard}
          imageUrl={product.images?.[0]} // <-- Передаем первую картинку из массива
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
  );
}

export default function Home() {
  return (
    <main className="min-h-screen relative overflow-hidden p-4 pb-20">
      <div className="fixed top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-500 rounded-full mix-blend-multiply dark:mix-blend-screen filter blur-[100px] opacity-30 dark:opacity-20"></div>
      <div className="fixed top-[20%] right-[-10%] w-[30%] h-[50%] bg-purple-500 rounded-full mix-blend-multiply dark:mix-blend-screen filter blur-[100px] opacity-30 dark:opacity-20"></div>
      <div className="fixed bottom-[-20%] left-[20%] w-[50%] h-[40%] bg-cyan-400 rounded-full mix-blend-multiply dark:mix-blend-screen filter blur-[100px] opacity-30 dark:opacity-20"></div>

      <div className="relative z-10">
        <Header />

        <div className="max-w-7xl mx-auto glass-panel rounded-3xl p-12 text-center mt-8 mb-12">
          <h2 className="text-4xl font-bold mb-4 dark:text-white">Мир игровых приставок</h2>
          <p className="text-lg mb-8 opacity-80 dark:text-gray-300">Здесь скоро появится наш каталог товаров и спецпредложения.</p>
        </div>

        <div className="max-w-7xl mx-auto">
          <h3 className="text-2xl font-bold mb-6 ml-2 text-black dark:text-white">Популярные товары</h3>

          <Suspense fallback={
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="glass-panel rounded-2xl h-96 animate-pulse bg-gray-200/50 dark:bg-slate-800/50" />
              ))}
            </div>
          }>
            <ProductList />
          </Suspense>
        </div>
      </div>
    </main>
  );
}