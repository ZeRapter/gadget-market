"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import ProductCard from "@/components/ProductCard";
import { LayoutGrid, List, ShoppingCart, SlidersHorizontal, X, Search, MessageSquare } from "lucide-react";
import Link from "next/link";

export default function CatalogClient({ initialProducts }: { initialProducts: any[], categories: any[] }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const currentSort = searchParams.get("sort") || "new";
  const currentAvailability = searchParams.get("availability") || "";
  const currentMinPrice = searchParams.get("minPrice") || "";
  const currentMaxPrice = searchParams.get("maxPrice") || "";

  const [minPrice, setMinPrice] = useState(currentMinPrice);
  const [maxPrice, setMaxPrice] = useState(currentMaxPrice);
  const [view, setView] = useState<"grid" | "list">("grid");

  const updateFilter = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (value) params.set(key, value);
    else params.delete(key);
    router.push(`${pathname}?${params.toString()}`, { scroll: false });
  };

  const applyPriceFilter = () => {
    const params = new URLSearchParams(searchParams.toString());
    if (minPrice) params.set("minPrice", minPrice); else params.delete("minPrice");
    if (maxPrice) params.set("maxPrice", maxPrice); else params.delete("maxPrice");
    router.push(`${pathname}?${params.toString()}`, { scroll: false });
  };

  const clearFilters = () => {
    const category = searchParams.get("category");
    const params = new URLSearchParams();
    if (category) params.set("category", category);
    setMinPrice("");
    setMaxPrice("");
    router.push(`${pathname}?${params.toString()}`, { scroll: false });
  };

  return (
    <div className="flex flex-col lg:flex-row gap-8">
      <aside className="w-full lg:w-64 shrink-0">
        <div className="glass-panel rounded-2xl p-6 sticky top-24">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-bold flex items-center gap-2 dark:text-white">
              <SlidersHorizontal size={18} /> Фильтры
            </h2>
            <button onClick={clearFilters} className="text-xs text-red-500 hover:underline">
              Сбросить
            </button>
          </div>

          <div className="mb-6">
            <h3 className="text-sm font-semibold mb-3 dark:text-gray-300">Цена (₽)</h3>
            <div className="flex items-center gap-2 mb-3">
              <input 
                type="number" 
                placeholder="От" 
                value={minPrice}
                onChange={(e) => setMinPrice(e.target.value)}
                className="w-full p-2 text-sm rounded-lg border dark:border-slate-700 bg-transparent dark:text-white focus:ring-1 focus:ring-blue-500 outline-none"
              />
              <span className="text-gray-400 dark:text-gray-500">—</span>
              <input 
                type="number" 
                placeholder="До" 
                value={maxPrice}
                onChange={(e) => setMaxPrice(e.target.value)}
                className="w-full p-2 text-sm rounded-lg border dark:border-slate-700 bg-transparent dark:text-white focus:ring-1 focus:ring-blue-500 outline-none"
              />
            </div>
            <button onClick={applyPriceFilter} className="w-full py-2 bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 rounded-lg text-sm font-medium hover:bg-blue-200 transition-colors">
              Применить
            </button>
          </div>

          <div>
            <h3 className="text-sm font-semibold mb-3 dark:text-gray-300">Наличие</h3>
            <div className="flex flex-col gap-2">
              {[
                { id: "", label: "Все товары" },
                { id: "in_stock", label: "В наличии (любой филиал)" },
                { id: "ANGARSK", label: "В Ангарске" },
                { id: "IRKUTSK", label: "В Иркутске" },
                { id: "ON_ORDER", label: "Под заказ" },
              ].map((item) => (
                <label key={item.id} className="flex items-center gap-3 cursor-pointer group">
                  <div className={`w-4 h-4 rounded-full border flex items-center justify-center ${currentAvailability === item.id ? 'border-blue-500' : 'border-gray-300 dark:border-slate-600'}`}>
                    {currentAvailability === item.id && <div className="w-2 h-2 rounded-full bg-blue-500"></div>}
                  </div>
                  <span className="text-sm text-gray-700 dark:text-gray-300 group-hover:text-blue-500 transition-colors">
                    {item.label}
                  </span>
                  <input 
                    type="radio" 
                    className="hidden" 
                    checked={currentAvailability === item.id}
                    onChange={() => updateFilter("availability", item.id)}
                  />
                </label>
              ))}
            </div>
          </div>
        </div>
      </aside>

      <div className="flex-1">
        <div className="flex flex-col sm:flex-row justify-between items-center mb-6 gap-4">
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <span className="text-sm text-gray-500 dark:text-gray-400 whitespace-nowrap">Сортировка:</span>
            <select 
              value={currentSort}
              onChange={(e) => updateFilter("sort", e.target.value)}
              className="bg-white/50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 text-sm rounded-xl px-4 py-2 outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer dark:text-white w-full sm:w-auto"
            >
              <option value="new">Сначала новые</option>
              <option value="popular">По популярности</option>
              <option value="price_asc">Сначала дешевые</option>
              <option value="price_desc">Сначала дорогие</option>
              <option value="name_asc">По названию (А-Я)</option>
              <option value="name_desc">По названию (Я-А)</option>
            </select>
          </div>

          <div className="glass-panel p-1 rounded-xl flex gap-1 shrink-0">
            <button
              onClick={() => setView("grid")}
              className={`p-2 rounded-lg transition-colors ${view === "grid" ? "bg-blue-500 text-white shadow-md" : "text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-slate-800"}`}
              title="Сетка"
            >
              <LayoutGrid size={20} />
            </button>
            <button
              onClick={() => setView("list")}
              className={`p-2 rounded-lg transition-colors ${view === "list" ? "bg-blue-500 text-white shadow-md" : "text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-slate-800"}`}
              title="Список"
            >
              <List size={20} />
            </button>
          </div>
        </div>

        {initialProducts.length === 0 ? (
          <div className="glass-panel p-12 text-center rounded-2xl flex flex-col items-center">
            <X size={48} className="text-gray-300 dark:text-gray-600 mb-4" />
            <h2 className="text-xl font-bold dark:text-white mb-2">Ничего не найдено</h2>
            <p className="text-gray-500 dark:text-gray-400 mb-6 max-w-md">Попробуйте изменить параметры фильтрации или сбросить их.</p>
            <button onClick={clearFilters} className="px-6 py-2 bg-gray-200 dark:bg-slate-700 text-gray-800 dark:text-white rounded-xl hover:bg-gray-300 dark:hover:bg-slate-600 transition-colors font-medium">
              Сбросить фильтры
            </button>
          </div>
        ) : (
          <>
            {view === "grid" && (
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
                {initialProducts.map((product) => (
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
            )}

            {view === "list" && (
              <div className="flex flex-col gap-4">
                {initialProducts.map((product) => (
                  <Link key={product.id} href={`/product/${product.id}`} className="block">
                    <div className="glass-panel rounded-2xl p-4 flex gap-6 hover:shadow-[0_0_20px_rgba(30,144,255,0.4)] transition-all group">
                      <div className="w-32 h-32 shrink-0 bg-white dark:bg-slate-800 rounded-xl overflow-hidden flex items-center justify-center">
                        {product.images?.[0] ? (
                          <img src={product.images[0]} alt={product.name} className="w-full h-full object-contain p-2 mix-blend-multiply dark:mix-blend-normal" />
                        ) : (
                          <span className="text-xs text-gray-400 dark:text-gray-500">Нет фото</span>
                        )}
                      </div>

                      <div className="flex-1 flex flex-col justify-center">
                        <h3 className="text-xl font-bold text-gray-900 dark:text-white group-hover:text-blue-500 transition-colors">{product.name}</h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">Артикул: {product.sku}</p>
                        <div className="flex gap-4">
                          <span className="text-lg font-bold text-gray-900 dark:text-white">{(product.priceCash / 100).toLocaleString('ru-RU')} ₽ <span className="text-xs font-normal text-gray-500 dark:text-gray-400">нал.</span></span>
                          <span className="text-lg font-bold text-gray-500 dark:text-gray-400">{(product.priceCard / 100).toLocaleString('ru-RU')} ₽ <span className="text-xs font-normal">терм.</span></span>
                        </div>
                      </div>

                      <div className="w-48 shrink-0 flex flex-col justify-center items-end gap-2">
                        <span className={`text-xs font-semibold px-2 py-1 rounded-md ${
                            ["BOTH", "ANGARSK", "IRKUTSK"].includes(product.availability)
                              ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                              : 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400'
                        }`}>
                          {product.availability === "BOTH" ? "В наличии" : product.availability === "ON_ORDER" ? "Под заказ" : "В наличии"}
                        </span>
                        <button className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg font-medium flex items-center gap-2 transition-colors neon-hover">
                          <ShoppingCart size={18} /> В корзину
                        </button>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </>
        )}

        {/* ВСЕГДА ВИДИМАЯ КНОПКА "ЗАКАЗАТЬ ТОВАР" ВНИЗУ КАТАЛОГА */}
        <div className="mt-12 glass-panel p-8 rounded-3xl text-center border-2 border-dashed border-gray-300 dark:border-slate-700 bg-white/40 dark:bg-slate-900/40">
          <h2 className="text-2xl font-bold dark:text-white mb-3">Не нашли нужный товар?</h2>
          <p className="text-gray-500 dark:text-gray-400 mb-6 max-w-xl mx-auto">
            Мы можем найти для вас любую игру, аксессуар или коллекционную фигурку, даже если их нет в нашем каталоге. Оставьте заявку!
          </p>
          <Link href="/custom-request" className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-blue-500 to-blue-700 text-white rounded-xl font-bold text-lg neon-hover shadow-lg">
            <MessageSquare size={22} /> Заказать товар
          </Link>
        </div>

      </div>
    </div>
  );
}