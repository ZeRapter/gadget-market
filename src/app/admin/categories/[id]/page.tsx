import { Suspense } from "react";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { Plus, Folder, ChevronRight, Package, Edit } from "lucide-react";
import { notFound } from "next/navigation";
import DeleteProductButton from "../../products/DeleteProductButton";
import SubCategoriesClient from "./SubCategoriesClient";

async function CategoryDetails({ paramsPromise }: { paramsPromise: Promise<{ id: string }> }) {
  const { id } = await paramsPromise;

  const category = await prisma.category.findUnique({
    where: { id },
    include: { 
      children: true,
      parent: true,
      products: {
        orderBy: { createdAt: "desc" }
      }
    }
  });

  if (!category) notFound();

  return (
    <div>
      {/* Хлебные крошки */}
      <div className="mb-6 flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
        <Link href="/admin/categories" className="hover:text-blue-500 transition-colors">Все категории</Link>
        <ChevronRight size={14} />
        {category.parent && (
          <>
            <Link href={`/admin/categories/${category.parent.id}`} className="hover:text-blue-500 transition-colors">{category.parent.name}</Link>
            <ChevronRight size={14} />
          </>
        )}
        <span className="text-gray-900 dark:text-white font-medium">{category.name}</span>
      </div>

      {/* Заголовок и кнопки */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <Folder className="text-blue-500" size={26} />
            {category.name}
          </h1>
        </div>
        
        <div className="flex items-center gap-2">
          <Link 
            href={`/admin/categories/new?parent=${category.id}`} 
            className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-slate-700 rounded-xl transition-colors text-sm font-medium shadow-sm"
          >
            <Folder size={16} /> Подгруппа
          </Link>

          <Link 
            href={`/admin/products/new?category=${category.id}`} 
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl transition-colors text-sm font-medium shadow-sm"
          >
            <Plus size={16} /> Добавить товар
          </Link>
        </div>
      </div>

      {/* БЛОК 1: Компактные подгруппы (теперь с редактированием) */}
      <div className="mb-8">
        <h2 className="text-sm font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-3">Подгруппы ({category.children.length})</h2>
        
        <SubCategoriesClient initialCategories={category.children} />
      </div>

      {/* БЛОК 2: Товары в этой категории */}
      <div>
        <h2 className="text-sm font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-3">Товары в категории ({category.products.length})</h2>
        
        {category.products.length === 0 ? (
          <div className="p-8 bg-white dark:bg-slate-900 rounded-2xl border border-gray-200 dark:border-slate-800 text-center">
             <Package className="mx-auto text-gray-300 dark:text-gray-600 mb-3" size={32} />
             <p className="text-gray-500 dark:text-gray-400 text-sm">Здесь пока нет товаров. Нажмите «Добавить товар».</p>
          </div>
        ) : (
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-gray-200 dark:border-slate-800 overflow-hidden">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50 dark:bg-slate-800/50 border-b border-gray-200 dark:border-slate-800 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  <th className="p-3">Товар</th>
                  <th className="p-3">Цены</th>
                  <th className="p-3">Наличие</th>
                  <th className="p-3 text-right">Действия</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-slate-800">
                {category.products.map((product) => (
                  <tr key={product.id} className="hover:bg-gray-50 dark:hover:bg-slate-800/30 transition-colors">
                    <td className="p-3">
                      <p className="font-bold text-gray-900 dark:text-white text-sm">{product.name}</p>
                      <p className="text-xs text-gray-500">Арт: {product.sku}</p>
                    </td>
                    <td className="p-3">
                      <p className="font-medium text-gray-900 dark:text-white text-sm">{(product.priceCash / 100).toLocaleString('ru-RU')} ₽</p>
                      <p className="text-xs text-gray-500">{(product.priceCard / 100).toLocaleString('ru-RU')} ₽ терм.</p>
                    </td>
                    <td className="p-3">
                      <span className={`text-[11px] font-semibold px-2 py-1 rounded-md ${
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
                    <td className="p-3 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Link 
                          href={`/admin/products/${product.id}/edit`}
                          className="p-1.5 text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors" 
                          title="Редактировать"
                        >
                          <Edit size={16} />
                        </Link>
                        <DeleteProductButton productId={product.id} />
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

export default function CategoryPage({ params }: { params: Promise<{ id: string }> }) {
  return (
    <div>
      <Suspense fallback={<div className="p-8 text-center text-gray-500 dark:text-gray-400">Загрузка категории...</div>}>
        <CategoryDetails paramsPromise={params} />
      </Suspense>
    </div>
  );
}