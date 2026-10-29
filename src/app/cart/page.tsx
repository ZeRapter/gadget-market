"use client";

import Link from "next/link";
import { useCart } from "@/context/CartContext";
import Header from "@/components/Header";
import { Trash2, ArrowRight, ShoppingBag, ArrowLeft, Store, Truck } from "lucide-react";

export default function CartPage() {
  const { cart, removeFromCart, cartCount } = useCart();

  const totalCash = cart.reduce((sum, item) => sum + (item.priceCash * item.quantity), 0);
  const totalCard = cart.reduce((sum, item) => sum + (item.priceCard * item.quantity), 0);

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
              <div className="lg:col-span-2 flex flex-col gap-4">
                {cart.map((item) => (
                  <div key={item.id} className="glass-panel rounded-2xl p-4 flex gap-4 items-center">
                    <div className="w-20 h-20 shrink-0 bg-white dark:bg-slate-800 rounded-xl overflow-hidden flex items-center justify-center">
                      {item.imageUrl ? (
                        <img src={item.imageUrl} alt={item.name} className="w-full h-full object-contain p-2 mix-blend-multiply dark:mix-blend-normal" />
                      ) : (
                        <ShoppingBag size={24} className="text-gray-400 dark:text-gray-500" />
                      )}
                    </div>
                    
                    <div className="flex-1">
                      <Link href={`/product/${item.id}`} className="font-bold text-gray-900 dark:text-white hover:text-blue-500 transition-colors line-clamp-2">
                        {item.name}
                      </Link>
                      <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                        {item.quantity} шт. × {(item.priceCash / 100).toLocaleString('ru-RU')} ₽
                      </p>
                    </div>

                    <div className="text-right">
                      <p className="font-bold text-lg text-gray-900 dark:text-white">
                        {((item.priceCash * item.quantity) / 100).toLocaleString('ru-RU')} ₽
                      </p>
                      <button 
                        onClick={() => removeFromCart(item.id)}
                        className="text-red-500 hover:text-red-700 text-sm flex items-center gap-1 mt-2 ml-auto transition-colors"
                      >
                        <Trash2 size={14} /> Удалить
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              <div className="lg:col-span-1">
                <div className="glass-panel rounded-2xl p-6 sticky top-24">
                  <h2 className="text-xl font-bold dark:text-white mb-4">Сумма заказа</h2>
                  
                  <div className="space-y-3 mb-6 border-b border-gray-200 dark:border-slate-700 pb-4">
                    <div className="flex justify-between text-gray-600 dark:text-gray-400">
                      <span>Наличными:</span>
                      <span className="font-semibold text-gray-900 dark:text-white">{(totalCash / 100).toLocaleString('ru-RU')} ₽</span>
                    </div>
                    <div className="flex justify-between text-gray-600 dark:text-gray-400 text-sm">
                      <span>По терминалу:</span>
                      <span className="dark:text-gray-300">{(totalCard / 100).toLocaleString('ru-RU')} ₽</span>
                    </div>
                  </div>

                  <div className="flex flex-col gap-4">
                    <div className="flex flex-col">
                      <Link href="/checkout" className="w-full flex items-center justify-center gap-2 py-4 bg-gradient-to-r from-blue-500 to-blue-700 text-white rounded-xl font-bold text-lg neon-hover shadow-lg">
                        <Truck size={20} /> Оформить доставку
                      </Link>
                      <p className="text-[11px] text-center text-gray-500 dark:text-gray-400 mt-1.5 px-2">
                        * Только для клиентов из других городов
                      </p>
                    </div>

                    <div className="flex flex-col">
                      <Link href="/checkout?mode=booking" className="w-full flex items-center justify-center gap-2 py-4 bg-white dark:bg-slate-800 border-2 border-blue-500 text-blue-500 dark:text-blue-400 rounded-xl font-bold text-lg hover:bg-blue-50 dark:hover:bg-slate-700 transition-colors">
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