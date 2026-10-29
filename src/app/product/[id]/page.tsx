import { Suspense } from "react";
import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import Link from "next/link";
import Header from "@/components/Header";
import ProductActions from "@/components/ProductActions";
import { ArrowLeft, ShieldCheck, Box, CreditCard } from "lucide-react";

async function ProductDetails({ paramsPromise }: { paramsPromise: Promise<{ id: string }> }) {
  const { id } = await paramsPromise;

  const product = await prisma.product.findUnique({
    where: { id },
    include: { category: true },
  });

  if (!product) notFound();

  const isAvailable = ["BOTH", "ANGARSK", "IRKUTSK"].includes(product.availability);
  const imageUrl = product.images?.[0];

  return (
    <div className="max-w-7xl mx-auto">
      <div className="mb-6 flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
        <Link href="/catalog" className="hover:text-blue-500 flex items-center gap-1 transition-colors">
          <ArrowLeft size={16} /> В каталог
        </Link>
        <span>/</span>
        <span className="text-gray-900 dark:text-white font-medium">{product.name}</span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="glass-panel rounded-3xl p-8 flex items-center justify-center h-[400px] lg:h-[600px] relative overflow-hidden">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[80%] h-[80%] bg-blue-400/20 dark:bg-blue-500/10 rounded-full blur-3xl"></div>
          {imageUrl ? (
            <img 
              src={imageUrl} 
              alt={product.name} 
              className="w-full h-full object-contain drop-shadow-2xl mix-blend-multiply dark:mix-blend-normal transition-transform duration-500 hover:scale-105 relative z-10" 
            />
          ) : (
            <span className="text-gray-400 dark:text-gray-500 text-xl font-medium relative z-10">Нет фотографии</span>
          )}
        </div>

        <div className="flex flex-col">
          <div className="mb-2 text-sm text-blue-500 font-semibold uppercase tracking-wider">
            {product.category?.name || "Товар"}
          </div>
          
          <h1 className="text-3xl lg:text-4xl font-bold text-gray-900 dark:text-white mb-4">
            {product.name}
          </h1>
          
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">Артикул: {product.sku}</p>

          <div className="glass-panel rounded-2xl p-6 mb-8">
            <div className="flex flex-col gap-2">
              {/* ИСПРАВЛЕНО: добавлен dark:text-white */}
              <span className="text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                {(product.priceCash / 100).toLocaleString('ru-RU')} ₽ 
                <span className="text-base font-normal text-gray-500 dark:text-gray-400">наличными</span>
              </span>
              <span className="text-xl font-medium text-gray-600 dark:text-gray-300 flex items-center gap-2">
                <CreditCard size={20} className="text-gray-400 dark:text-gray-500" />
                {(product.priceCard / 100).toLocaleString('ru-RU')} ₽ 
                <span className="text-sm font-normal">по терминалу</span>
              </span>
            </div>
          </div>

          <div className="flex items-center gap-4 mb-8">
            <span className={`text-sm font-bold px-4 py-2 rounded-xl ${
              isAvailable 
                ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' 
                : product.availability === 'ON_ORDER'
                  ? 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400'
                  : 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400'
            }`}>
              {product.availability === "BOTH" ? "В наличии (в двух филиалах)" : 
               product.availability === "ANGARSK" ? "В наличии в Ангарске" : 
               product.availability === "IRKUTSK" ? "В наличии в Иркутске" : 
               product.availability === "ON_ORDER" ? "Под заказ" : "Нет в наличии"}
            </span>
          </div>

          <ProductActions product={product} />

          {product.description && (
            <div className="mt-10">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Описание</h2>
              <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                {product.description}
              </p>
            </div>
          )}

          <div className="mt-8 grid grid-cols-2 gap-4">
            <div className="glass-panel rounded-xl p-4 flex items-center gap-3">
              <ShieldCheck className="text-blue-500" size={24} />
              <div>
                <p className="text-xs text-gray-500 dark:text-gray-400">Состояние</p>
                <p className="font-medium text-sm dark:text-white">{product.condition}</p>
              </div>
            </div>
            <div className="glass-panel rounded-xl p-4 flex items-center gap-3">
              <Box className="text-blue-500" size={24} />
              <div>
                <p className="text-xs text-gray-500 dark:text-gray-400">Бронь до</p>
                <p className="font-medium text-sm dark:text-white">{product.maxBookingHours} часов</p>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}

export default function ProductPage({ params }: { params: Promise<{ id: string }> }) {
  return (
    <main className="min-h-screen relative overflow-hidden p-4 pb-20">
      <div className="fixed top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-500 rounded-full mix-blend-multiply dark:mix-blend-screen filter blur-[100px] opacity-30 dark:opacity-20"></div>
      <div className="fixed top-[20%] right-[-10%] w-[30%] h-[50%] bg-purple-500 rounded-full mix-blend-multiply dark:mix-blend-screen filter blur-[100px] opacity-30 dark:opacity-20"></div>
      
      <div className="relative z-10">
        <Header />
        <div className="mt-8">
          <Suspense fallback={<div className="text-center text-gray-500 dark:text-gray-400 py-20">Загрузка товара...</div>}>
            <ProductDetails paramsPromise={params} />
          </Suspense>
        </div>
      </div>
    </main>
  );
}