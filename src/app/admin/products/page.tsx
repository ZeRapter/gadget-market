import { Suspense } from "react";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { Plus, Edit, Package } from "lucide-react";
import DeleteProductButton from "./DeleteProductButton";

// Асинхронный компонент для получения и отображения товаров
async function ProductList() {
  const products = await prisma.product.findMany({
    include: { category: true }, // Подтягиваем название категории
    orderBy: { createdAt: "desc" },
  });

  if (products.length === 0) {
    return (
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-gray-200 dark:border-slate-800 p-12 text-center flex flex-col items-center justify-center">
        <div className="w-16 h-16 bg-blue-50 dark:bg-slate-800 rounded-full flex items-center justify-center text-blue-500 mb-4">
          <Package size={32} />
        </div>
        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">Список товаров пуст</h3>
        <p className="text-gray-500 max-w-sm mb-6">Здесь будет отображаться таблица со всеми вашими товарами.</p>
        <Link href="/admin/products/new" className="text-blue-500 font-medium hover:underline">
          Добавить первый товар &rarr;
        </Link>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-gray-200 dark:border-slate-800 overflow-hidden">
      <table className="w-full text-left border-collapse">
        <thead>
          <tr className="bg-gray-50 dark:bg-slate-800/50 border-b border-gray-200 dark:border-slate-800 text-sm font-medium text-gray-500 dark:text-gray-400">
            <th className="p-4">Товар</th>
            <th className="p-4">Категория</th>
            <th className="p-4">Цены (нал / терм)</th>
            <th className="p-4">Наличие</th>
            <th className="p-4 text-right">Действия</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100 dark:divide-slate-800">
          {products.map((product) => (
            <tr key={product.id} className="hover:bg-gray-50 dark:hover:bg-slate-800/30 transition-colors">
              <td className="p-4">
                <p className="font-bold text-gray-900 dark:text-white">{product.name}</p>
                <p className="text-xs text-gray-500">Арт: {product.sku}</p>
              </td>
              <td className="p-4 text-sm text-gray-600 dark:text-gray-300">
                {product.category?.name || "Без категории"}
              </td>
              <td className="p-4">
                <p className="font-medium text-gray-900 dark:text-white">{(product.priceCash / 100).toLocaleString('ru-RU')} ₽</p>
                <p className="text-xs text-gray-500">{(product.priceCard / 100).toLocaleString('ru-RU')} ₽ терм.</p>
              </td>
              <td className="p-4">
                <span className={`text-xs font-semibold px-2 py-1 rounded-md ${
                  product.availability === "BOTH" || product.availability === "ANGARSK" || product.availability === "IRKUTSK"
                    ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                    : product.availability === "ON_ORDER"
                    ? "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400"
                    : "bg-gray-100 text-gray-600 dark:bg-slate-800 dark:text-gray-400"
                }`}>
                  {product.availability === "BOTH" ? "Везде" : 
                   product.availability === "ANGARSK" ? "Ангарск" : 
                   product.availability === "IRKUTSK" ? "Иркутск" : 
                   product.availability === "ON_ORDER" ? "Под заказ" : "Нет"}
                </span>
              </td>
              <td className="p-4 text-right">
                <div className="flex items-center justify-end gap-2">
                  
                  {/* ВОТ ОНА - РАБОЧАЯ ССЫЛКА НА РЕДАКТИРОВАНИЕ */}
                  <Link 
                    href={`/admin/products/${product.id}/edit`}
                    className="p-2 text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors" 
                    title="Редактировать"
                  >
                    <Edit size={18} />
                  </Link>

                  <DeleteProductButton productId={product.id} />
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default function AdminProductsPage() {
  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Товары</h1>
          <p className="text-gray-500 mt-1">Управление каталогом магазина</p>
        </div>
        
        <Link 
          href="/admin/products/new" 
          className="flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl transition-colors font-medium shadow-sm"
        >
          <Plus size={20} /> Добавить товар
        </Link>
      </div>

      <Suspense fallback={<div className="p-8 text-center text-gray-500">Загрузка товаров из базы...</div>}>
        <ProductList />
      </Suspense>
    </div>
  );
}