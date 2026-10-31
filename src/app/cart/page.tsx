"use client";

import Link from "next/link";
import { useState } from "react";
import { useCart } from "@/context/CartContext";
import Header from "@/components/Header";
import { Trash2, ShoppingBag, ArrowLeft, Store, Truck, Tag, X, Loader2, Minus, Plus } from "lucide-react";

export default function CartPage() {
  // Достаем функцию updateQuantity из контекста
  const { cart, removeFromCart, updateQuantity, cartCount } = useCart();

  // Стейты для промокода
  const [promoInput, setPromoInput] = useState("");
  const [appliedPromo, setAppliedPromo] = useState<any>(null);
  const [promoError, setPromoError] = useState("");
  const [promoLoading, setPromoLoading] = useState(false);

  const handleApplyPromo = async () => {
    if (!promoInput.trim()) return;
    setPromoLoading(true);
    setPromoError("");

    try {
      const res = await fetch("/api/promocodes/validate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: promoInput }),
      });

      const data = await res.json();

      if (res.ok) {
        setAppliedPromo(data);
        setPromoInput("");
      } else {
        setPromoError(data.error || "Ошибка промокода");
      }
    } catch (e) {
      setPromoError("Ошибка сети");
    } finally {
      setPromoLoading(false);
    }
  };

  const removePromo = () => {
    setAppliedPromo(null);
    setPromoError("");
  };

  const totalCash = cart.reduce((sum, item) => sum + (item.priceCash * item.quantity), 0);
  const totalCard = cart.reduce((sum, item) => sum + (item.priceCard * item.quantity), 0);

  // Расчет скидки
  let discountCash = 0;
  let discountCard = 0;

  if (appliedPromo) {
    if (appliedPromo.discountPct) {
      discountCash = Math.round(totalCash * (appliedPromo.discountPct / 100));
      discountCard = Math.round(totalCard * (appliedPromo.discountPct / 100));
    } else if (appliedPromo.discountAmt) {
      const discountAmtKopecks = appliedPromo.discountAmt * 100;
      discountCash = Math.min(discountAmtKopecks, totalCash);
      discountCard = Math.min(discountAmtKopecks, totalCard);
    }
  }

  const finalCash = totalCash - discountCash;
  const finalCard = totalCard - discountCard;

  return (
    <main className="min-h-screen relative overflow-hidden p-4 pb-20">
      <div className="fixed top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-500 rounded-full mix-blend-multiply dark:mix-blend-screen filter blur-[100px] opacity-30 dark:opacity-20"></div>
      <div className="fixed top-[20%] right-[-10%] w-[30%] h-[50%] bg-purple-500 rounded-full mix-blend-multiply dark:mix-blend-screen filter blur-[100px] opacity-30 dark:opacity-20"></div>
      
      <div className="relative z-10">
        <Header />
        
        <div className="max-w-4xl mx-auto mt-8">
          <div className="flex items-center gap-2 mb-8">
            <Link href="/catalog" className="text-blue-500 hover:text-blue-600 flex items-center gap-1 text-sm font-medium transition-colors">
              <ArrowLeft size={16} /> Продолжить покупки
            </Link>
          </div>

          <h1 className="text-3xl font-bold dark:text-white mb-8">Корзина {cartCount > 0 && `(${cartCount})`}</h1>

          {cart.length === 0 ? (
            <div className="glass-panel p-12 text-center rounded-3xl">
              <ShoppingBag size={64} className="mx-auto text-gray-300 dark:text-gray-600 mb-6" />
              <h2 className="text-xl font-bold dark:text-white mb-2">Ваша корзина пуста</h2>
              <p className="text-gray-500 dark:text-gray-400 mb-8">Добавьте товары из каталога, чтобы оформить заказ.</p>
              <Link href="/catalog" className="px-8 py-3 bg-blue-500 text-white rounded-xl font-bold hover:bg-blue-600 transition-colors inline-block">
                Перейти в каталог
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              
              {/* СПИСОК ТОВАРОВ */}
              <div className="lg:col-span-2 flex flex-col gap-4">
                {cart.map((item) => (
                  <div key={item.id} className="glass-panel rounded-2xl p-4 flex flex-col sm:flex-row gap-4 items-center sm:items-stretch">
                    <div className="w-20 h-20 shrink-0 bg-white dark:bg-slate-800 rounded-xl overflow-hidden flex items-center justify-center">
                      {item.imageUrl ? (
                        <img src={item.imageUrl} alt={item.name} className="w-full h-full object-contain p-2 mix-blend-multiply dark:mix-blend-normal" />
                      ) : (
                        <ShoppingBag size={24} className="text-gray-400 dark:text-gray-500" />
                      )}
                    </div>
                    
                    <div className="flex-1 flex flex-col justify-center items-center sm:items-start text-center sm:text-left">
                      <Link href={`/product/${item.id}`} className="font-bold text-gray-900 dark:text-white hover:text-blue-500 transition-colors line-clamp-2">
                        {item.name}
                      </Link>
                      
                      {/* БЛОК ЦЕНЫ И РЕГУЛЯТОРА КОЛИЧЕСТВА */}
                      <div className="flex items-center gap-3 mt-2">
                        <span className="text-sm text-gray-500 dark:text-gray-400">
                          {(item.priceCash / 100).toLocaleString('ru-RU')} ₽
                        </span>
                        <div className="flex items-center border border-gray-200 dark:border-slate-700 rounded-lg overflow-hidden bg-white dark:bg-slate-800">
                          <button 
                            onClick={() => updateQuantity(item.id, item.quantity - 1)} 
                            className="px-2 py-1 hover:text-blue-500 hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors"
                          >
                            <Minus size={14} />
                          </button>
                          <span className="px-3 text-sm font-bold dark:text-white">{item.quantity}</span>
                          <button 
                            onClick={() => updateQuantity(item.id, item.quantity + 1)} 
                            className="px-2 py-1 hover:text-blue-500 hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors"
                          >
                            <Plus size={14} />
                          </button>
                        </div>
                      </div>
                    </div>

                    <div className="text-center sm:text-right flex flex-col justify-center shrink-0 w-full sm:w-auto mt-2 sm:mt-0 pt-4 sm:pt-0 border-t border-gray-100 dark:border-slate-800 sm:border-0">
                      <p className="font-bold text-lg text-gray-900 dark:text-white">
                        {((item.priceCash * item.quantity) / 100).toLocaleString('ru-RU')} ₽
                      </p>
                      <button 
                        onClick={() => removeFromCart(item.id)}
                        className="text-red-500 hover:text-red-700 text-sm flex items-center justify-center sm:justify-end gap-1 mt-1 transition-colors"
                      >
                        <Trash2 size={14} /> Удалить
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {/* БЛОК ОФОРМЛЕНИЯ */}
              <div className="lg:col-span-1">
                <div className="glass-panel rounded-2xl p-6 sticky top-24">
                  <h2 className="text-xl font-bold dark:text-white mb-4">Сумма заказа</h2>

                  {/* ПРОМОКОД */}
                  <div className="mb-6">
                    {!appliedPromo ? (
                      <div>
                        <div className="flex gap-2">
                          <div className="relative flex-1">
                            <Tag className="absolute left-3 top-2.5 text-gray-400" size={16} />
                            <input 
                              type="text" 
                              placeholder="Промокод" 
                              value={promoInput}
                              onChange={(e) => setPromoInput(e.target.value.toUpperCase())}
                              className="w-full pl-9 pr-3 py-2 text-sm rounded-xl border dark:border-slate-700 bg-gray-50 dark:bg-slate-800 dark:text-white outline-none focus:ring-2 focus:ring-blue-500"
                            />
                          </div>
                          <button 
                            onClick={handleApplyPromo} 
                            disabled={promoLoading || !promoInput}
                            className="px-4 py-2 bg-slate-800 dark:bg-slate-700 text-white text-sm font-medium rounded-xl hover:bg-slate-700 transition-colors disabled:opacity-50 flex items-center gap-2"
                          >
                            {promoLoading ? <Loader2 size={16} className="animate-spin" /> : "ОК"}
                          </button>
                        </div>
                        {promoError && <p className="text-red-500 text-xs mt-2">{promoError}</p>}
                      </div>
                    ) : (
                      <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-900/50 p-3 rounded-xl flex items-center justify-between">
                        <div>
                          <p className="text-xs text-green-600 dark:text-green-400 font-medium">Промокод применен</p>
                          <p className="font-bold text-green-700 dark:text-green-300">{appliedPromo.code}</p>
                        </div>
                        <button onClick={removePromo} className="p-1 text-green-600 hover:bg-green-100 dark:hover:bg-green-900/50 rounded-lg transition-colors">
                          <X size={18} />
                        </button>
                      </div>
                    )}
                  </div>

                  <div className="space-y-3 mb-6 border-b border-gray-200 dark:border-slate-700 pb-4">
                    <div className="flex justify-between text-gray-600 dark:text-gray-400">
                      <span>Наличными:</span>
                      <span className={`font-semibold ${discountCash > 0 ? "line-through text-gray-400" : "text-gray-900 dark:text-white"}`}>
                        {(totalCash / 100).toLocaleString('ru-RU')} ₽
                      </span>
                    </div>
                    {discountCash > 0 && (
                      <div className="flex justify-between text-green-500 text-sm">
                        <span>Скидка:</span>
                        <span>-{(discountCash / 100).toLocaleString('ru-RU')} ₽</span>
                      </div>
                    )}
                    <div className="flex justify-between font-bold text-lg text-gray-900 dark:text-white pt-1">
                      <span>К оплате:</span>
                      <span>{(finalCash / 100).toLocaleString('ru-RU')} ₽</span>
                    </div>

                    <div className="flex justify-between text-gray-600 dark:text-gray-400 text-sm mt-3 pt-3 border-t border-gray-100 dark:border-slate-800">
                      <span>По терминалу:</span>
                      <span className={discountCard > 0 ? "line-through text-gray-400" : ""}>
                        {(totalCard / 100).toLocaleString('ru-RU')} ₽
                      </span>
                    </div>
                    {discountCard > 0 && (
                      <div className="flex justify-between text-green-500 text-sm">
                        <span>Скидка:</span>
                        <span>-{(discountCard / 100).toLocaleString('ru-RU')} ₽</span>
                      </div>
                    )}
                    <div className="flex justify-between font-bold text-gray-900 dark:text-white">
                      <span>К оплате:</span>
                      <span>{(finalCard / 100).toLocaleString('ru-RU')} ₽</span>
                    </div>
                  </div>

                  <div className="flex flex-col gap-4">
                    <div className="flex flex-col">
                      <Link href={`/checkout?promo=${appliedPromo?.code || ""}`} className="w-full flex items-center justify-center gap-2 py-4 bg-gradient-to-r from-blue-500 to-blue-700 text-white rounded-xl font-bold text-lg neon-hover shadow-lg">
                        <Truck size={20} /> Оформить доставку
                      </Link>
                      <p className="text-[11px] text-center text-gray-500 dark:text-gray-400 mt-1.5 px-2">
                        * Только для клиентов из других городов
                      </p>
                    </div>

                    <div className="flex flex-col">
                      <Link href={`/checkout?mode=booking&promo=${appliedPromo?.code || ""}`} className="w-full flex items-center justify-center gap-2 py-4 bg-white dark:bg-slate-800 border-2 border-blue-500 text-blue-500 dark:text-blue-400 rounded-xl font-bold text-lg hover:bg-blue-50 dark:hover:bg-slate-700 transition-colors">
                        <Store size={20} /> Забронировать в магазине
                      </Link>
                      <p className="text-[11px] text-center text-gray-500 dark:text-gray-400 mt-1.5 px-2">
                        * Забрать самостоятельно в Ангарске или Иркутске
                      </p>
                    </div>
                  </div>
                  
                  <p className="text-xs text-gray-500 dark:text-gray-400 text-center mt-6">
                    Оплата производится при получении или после согласования с менеджером.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}