"use client";

import { useState } from "react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import ProductCard from "@/components/ProductCard";
import { LayoutGrid, List, ShoppingCart, SlidersHorizontal, X, ChevronRight, Folder, Search } from "lucide-react";
import Link from "next/link";

export default function CatalogClient({ initialProducts, categories }: { initialProducts: any[], categories: any[] }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const currentSort = searchParams.get("sort") || "new";
  const currentAvailability = searchParams.get("availability") || "";
  const currentCategoryId = searchParams.get("category") || "";
  const currentMinPrice = searchParams.get("minPrice") || "";
  const currentMaxPrice = searchParams.get("maxPrice") || "";

  const [minPrice, setMinPrice] = useState(currentMinPrice);
  const [maxPrice, setMaxPrice] = useState(currentMaxPrice);
  const [view, setView] = useState<"grid" | "list">("grid");
  
  // НОВЫЙ СТЕЙТ ДЛЯ КОЛИЧЕСТВА КОЛОНОК
  const [gridCols, setGridCols] = useState<2 | 3 | 4>(2);
  
  const [isMobileFiltersOpen, setIsMobileFiltersOpen] = useState(false);

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
    setIsMobileFiltersOpen(false);
  };

  const clearFilters = () => {
    const category = searchParams.get("category");
    const params = new URLSearchParams();
    if (category) params.set("category", category);
    setMinPrice("");
    setMaxPrice("");
    router.push(`${pathname}?${params.toString()}`, { scroll: false });
    setIsMobileFiltersOpen(false);
  };

  // ФУНКЦИЯ ДЛЯ ОПРЕДЕЛЕНИЯ КЛАССОВ СЕТКИ
  const getGridClass = () => {
    if (gridCols === 3) return "grid-cols-3 md:grid-cols-3 xl:grid-cols-4";
    if (gridCols === 4) return "grid-cols-4 md:grid-cols-4 xl:grid-cols-5";
    return "grid-cols-2 md:grid-cols-2 xl:grid-cols-3";
  };

  const activeCategory = categories.find(c => c.id === currentCategoryId);
  const subCategories = activeCategory 
    ? categories.filter(c => c.parentId === activeCategory.id)
    : categories.filter(c => c.parentId === null);

  const FiltersContent = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-sm font-semibold mb-3 dark:text-gray-300">Цена (₽)</h3>
        <div className="flex items-center gap-2 mb-3">
          <input type="number" placeholder="От" value={minPrice} onChange={(e) => setMinPrice(e.target.value)} className="w-full p-2 text-sm rounded-lg border dark:border-slate-700 bg-transparent dark:text-white focus:ring-1 focus:ring-blue-500 outline-none" />
          <span className="text-gray-400 dark:text-gray-500">—</span>
          <input type="number" placeholder="До" value={maxPrice} onChange={(e) => setMaxPrice(e.target.value)} className="w-full p-2 text-sm rounded-lg border dark:border-slate-700 bg-transparent dark:text-white focus:ring-1 focus:ring-blue-500 outline-none" />
        </div>
        <button onClick={applyPriceFilter} className="w-full py-2 bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 rounded-lg text-sm font-medium hover:bg-blue-200 transition-colors">
          Применить
        </button>
      </div>

      <div>
        <h3 className="text-sm font-semibold mb-3 dark:text-gray-300">Наличие</h3>
        <div className="flex flex-col gap-3">
          {[
            { id: "", label: "Все товары" },
            { id: "in_stock", label: "В наличии (любой филиал)" },
            { id: "ANGARSK", label: "В Ангарске" },
            { id: "IRKUTSK", label: "В Иркутске" },
            { id: "ON_ORDER", label: "Под заказ" },
          ].map((item) => (
            <label key={item.id} className="flex items-center gap-3 cursor-pointer group">
              <div className={`w-4 h-4 rounded-full border flex items-center justify-center shrink-0 ${currentAvailability === item.id ? 'border-blue-500' : 'border-gray-300 dark:border-slate-600'}`}>
                {currentAvailability === item.id && <div className="w-2 h-2 rounded-full bg-blue-500"></div>}
              </div>
              <span className="text-sm text-gray-700 dark:text-gray-300 group-hover:text-blue-500 transition-colors">
                {item.label}
              </span>
              <input type="radio" className="hidden" checked={currentAvailability === item.id} onChange={() => { updateFilter("availability", item.id); setIsMobileFiltersOpen(false); }} />
            </label>
          ))}
        </div>
      </div>
    </div>
  );

  return (
    <div className="flex flex-col lg:flex-row gap-8">
      
      {/* МОБИЛЬНЫЙ СПИСОК КАТЕГОРИЙ */}
      <div className="md:hidden w-full flex flex-col gap-4 mb-4">
        {activeCategory && (
          <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400 mb-2">
            <button onClick={() => updateFilter("category", "")} className="hover:text-blue-500 transition-colors">Каталог</button>
            <ChevronRight size={14} />
            <span className="text-gray-900 dark:text-white font-medium">{activeCategory.name}</span>
          </div>
        )}

        {subCategories.length > 0 && (
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-gray-200 dark:border-slate-800 overflow-hidden">
            {subCategories.map((cat) => (
              <button key={cat.id} onClick={() => updateFilter("category", cat.id)} className="w-full flex items-center justify-between p-4 border-b border-gray-100 dark:border-slate-800 last:border-0 hover:bg-gray-50 dark:hover:bg-slate-800/50 transition-colors">
                <div className="flex items-center gap-3">
                  <Folder size={18} className="text-blue-500" />
                  <span className="font-medium text-gray-900 dark:text-white">{cat.name}</span>
                </div>
                <ChevronRight size={18} className="text-gray-400" />
              </button>
            ))}
          </div>
        )}
        
        <button onClick={() => setIsMobileFiltersOpen(true)} className="flex items-center justify-center gap-2 w-full py-3 bg-blue-50 dark:bg-slate-800 text-blue-600 dark:text-blue-400 rounded-xl font-medium">
          <SlidersHorizontal size={18} /> Показать фильтры
        </button>
      </div>

      {/* САЙДБАР ФИЛЬТРОВ (ДЕСКТОП) */}
      <aside className="hidden md:block w-full lg:w-64 shrink-0">
        <div className="glass-panel rounded-2xl p-6 sticky top-24">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-bold flex items-center gap-2 dark:text-white">
              <SlidersHorizontal size={18} /> Фильтры
            </h2>
            <button onClick={clearFilters} className="text-xs text-red-500 hover:underline">Сбросить</button>
          </div>
          <FiltersContent />
        </div>
      </aside>

      {/* ОСНОВНОЙ КОНТЕНТ */}
      <div className="flex-1">
        <div className="flex flex-col sm:flex-row justify-between items-center mb-6 gap-4">
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <span className="text-sm text-gray-500 dark:text-gray-400 whitespace-nowrap">Сортировка:</span>
            <select value={currentSort} onChange={(e) => updateFilter("sort", e.target.value)} className="bg-white/50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 text-sm rounded-xl px-4 py-2 outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer dark:text-white w-full sm:w-auto">
              <option value="new">Сначала новые</option>
              <option value="popular">По популярности</option>
              <option value="price_asc">Сначала дешевые</option>
              <option value="price_desc">Сначала дорогие</option>
              <option value="name_asc">По названию (А-Я)</option>
              <option value="name_desc">По названию (Я-А)</option>
            </select>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {/* ПЕРЕКЛЮЧАТЕЛЬ КОЛИЧЕСТВА КОЛОНОК (ПОЯВЛЯЕТСЯ ТОЛЬКО В РЕЖИМЕ СЕТКИ) */}
            {view === "grid" && (
              <div className="flex items-center bg-gray-100 dark:bg-slate-800 p-1 rounded-xl">
                {[2, 3, 4].map((num) => (
                  <button
                    key={num}
                    onClick={() => setGridCols(num as 2 | 3 | 4)}
                    className={`w-8 h-8 flex items-center justify-center rounded-lg text-sm font-bold transition-all ${
                      gridCols === num
                        ? "bg-white dark:bg-slate-700 text-blue-500 shadow-sm"
                        : "text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                    }`}
                  >
                    {num}
                  </button>
                ))}
              </div>
            )}

            {/* ПЕРЕКЛЮЧАТЕЛЬ СЕТКА / СПИСОК */}
            <div className="glass-panel p-1 rounded-xl flex gap-1">
              <button onClick={() => setView("grid")} className={`p-2 rounded-lg transition-colors ${view === "grid" ? "bg-blue-500 text-white shadow-md" : "text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-slate-800"}`} title="Сетка">
                <LayoutGrid size={20} />
              </button>
              <button onClick={() => setView("list")} className={`p-2 rounded-lg transition-colors ${view === "list" ? "bg-blue-500 text-white shadow-md" : "text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-slate-800"}`} title="Список">
                <List size={20} />
              </button>
            </div>
          </div>
        </div>

        {initialProducts.length === 0 ? (
          <div className="glass-panel p-12 text-center rounded-2xl flex flex-col items-center">
            <X size={48} className="text-gray-300 dark:text-gray-600 mb-4" />
            <h2 className="text-xl font-bold dark:text-white mb-2">Ничего не найдено</h2>
            <p className="text-gray-500 dark:text-gray-400 mb-6 max-w-md">Попробуйте изменить параметры фильтрации или сбросить их.</p>
            <button onClick={clearFilters} className="px-6 py-2 bg-gray-200 dark:bg-slate-700 text-gray-800 dark:text-white rounded-xl hover:bg-gray-300 dark:hover:bg-slate-600 transition-colors font-medium">Сбросить фильтры</button>
          </div>
        ) : (
          <>
            {view === "grid" && (
              // ПРИМЕНЯЕМ ДИНАМИЧЕСКИЙ КЛАСС СЕТКИ
              <div className={`grid ${getGridClass()} gap-3 sm:gap-6`}>
                {initialProducts.map((product) => (
                  <ProductCard key={product.id} id={product.id} title={product.name} priceCash={product.priceCash} priceCard={product.priceCard} imageUrl={product.images?.[0]} availability={product.availability === "BOTH" ? "В наличии" : product.availability === "ANGARSK" ? "В Ангарске" : product.availability === "IRKUTSK" ? "В Иркутске" : product.availability === "ON_ORDER" ? "Под заказ" : "Нет в наличии"} />
                ))}
              </div>
            )}

            {view === "list" && (
              <div className="flex flex-col gap-4">
                {initialProducts.map((product) => (
                  <Link key={product.id} href={`/product/${product.id}`} className="block">
                    <div className="glass-panel rounded-2xl p-4 flex flex-col sm:flex-row gap-4 hover:shadow-[0_0_20px_rgba(30,144,255,0.4)] transition-all group">
                      <div className="w-full sm:w-32 h-48 sm:h-32 shrink-0 bg-white dark:bg-slate-800 rounded-xl overflow-hidden flex items-center justify-center">
                        {product.images?.[0] ? <img src={product.images[0]} alt={product.name} className="w-full h-full object-contain p-2 mix-blend-multiply dark:mix-blend-normal" /> : <span className="text-xs text-gray-400 dark:text-gray-500">Нет фото</span>}
                      </div>
                      <div className="flex-1 flex flex-col justify-center">
                        <h3 className="text-xl font-bold text-gray-900 dark:text-white group-hover:text-blue-500 transition-colors">{product.name}</h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">Артикул: {product.sku}</p>
                        <div className="flex gap-4">
                          <span className="text-lg font-bold text-gray-900 dark:text-white">{(product.priceCash / 100).toLocaleString('ru-RU')} ₽ <span className="text-xs font-normal text-gray-500 dark:text-gray-400">нал.</span></span>
                          <span className="text-lg font-bold text-gray-500 dark:text-gray-400">{(product.priceCard / 100).toLocaleString('ru-RU')} ₽ <span className="text-xs font-normal">терм.</span></span>
                        </div>
                      </div>
                      <div className="w-full sm:w-48 shrink-0 flex flex-row sm:flex-col justify-between sm:justify-center items-center sm:items-end gap-2 mt-4 sm:mt-0">
                        <span className={`text-xs font-semibold px-2 py-1 rounded-md ${["BOTH", "ANGARSK", "IRKUTSK"].includes(product.availability) ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' : 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400'}`}>
                          {product.availability === "BOTH" ? "В наличии" : product.availability === "ON_ORDER" ? "Под заказ" : "В наличии"}
                        </span>
                        <button className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg font-medium flex items-center gap-2 transition-colors neon-hover"><ShoppingCart size={18} /> В корзину</button>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </>
        )}

        <div className="mt-12 glass-panel p-8 rounded-3xl text-center border-2 border-dashed border-gray-300 dark:border-slate-700 bg-white/40 dark:bg-slate-900/40">
          <h2 className="text-2xl font-bold dark:text-white mb-3">Не нашли нужный товар?</h2>
          <p className="text-gray-500 dark:text-gray-400 mb-6 max-w-xl mx-auto text-sm sm:text-base">Мы можем найти для вас любую игру, аксессуар или коллекционную фигурку. Оставьте заявку!</p>
          <Link href="/custom-request" className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-blue-500 to-blue-700 text-white rounded-xl font-bold text-lg neon-hover shadow-lg"><Search size={22} /> Заказать товар</Link>
        </div>
      </div>

      {/* МОБИЛЬНОЕ ОКНО ФИЛЬТРОВ */}
      {isMobileFiltersOpen && (
        <div className="fixed inset-0 z-[100] md:hidden flex flex-col justify-end">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setIsMobileFiltersOpen(false)} />
          <div className="relative bg-white dark:bg-slate-900 rounded-t-3xl shadow-2xl flex flex-col animate-slide-up max-h-[85dvh]">
            <div className="flex items-center justify-between p-6 pb-4 border-b border-gray-100 dark:border-slate-800 shrink-0">
              <h2 className="text-xl font-bold flex items-center gap-2 dark:text-white"><SlidersHorizontal size={20} /> Фильтры</h2>
              <button onClick={() => setIsMobileFiltersOpen(false)} className="p-2 bg-gray-100 dark:bg-slate-800 rounded-full text-gray-600 dark:text-gray-300"><X size={20} /></button>
            </div>
            <div className="p-6 pb-24 overflow-y-auto custom-scrollbar overscroll-contain">
              <FiltersContent />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}