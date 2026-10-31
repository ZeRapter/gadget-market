"use client";

import { Heart, ShoppingCart, Store, Minus, Plus, Truck } from "lucide-react";
import { useFavorites } from "@/context/FavoritesContext";
import { useCart } from "@/context/CartContext";
import BookingModal from "./BookingModal";
import { useState } from "react";
import { useRouter } from "next/navigation"; // Добавили роутер

interface ProductActionsProps {
  product: {
    id: string;
    name: string;
    priceCash: number;
    priceCard: number;
    images: string[];
    maxBookingHours: number;
  }
}

export default function ProductActions({ product }: ProductActionsProps) {
  const { isFavorite, toggleFavorite } = useFavorites();
  const { addToCart } = useCart();
  const [isBookingOpen, setIsBookingOpen] = useState(false);
  const [qty, setQty] = useState(1); 
  const router = useRouter(); // Инициализация роутера

  const isFav = isFavorite(product.id);

  const handleAddToCart = (redirectToCheckout = false) => {
    addToCart({
      id: product.id,
      name: product.name,
      priceCash: product.priceCash,
      priceCard: product.priceCard,
      imageUrl: product.images?.[0],
      quantity: qty,
    });
    
    if (redirectToCheckout) {
      router.push("/checkout"); // Перекидываем на оформление
    } else {
      alert(`Товар (${qty} шт.) добавлен в корзину!`);
      setQty(1); 
    }
  };

  return (
    <div className="flex flex-col gap-4 mt-6">
      
      {/* Ряд: Избранное + Регулятор количества + В корзину */}
      <div className="flex flex-col sm:flex-row items-stretch gap-3 w-full">
        <button
          onClick={() => toggleFavorite(product.id)}
          className={`p-4 rounded-xl border-2 transition-all flex items-center justify-center shrink-0 ${
            isFav 
              ? "border-red-500 bg-red-50 text-red-500 dark:bg-red-900/20" 
              : "border-gray-200 dark:border-slate-700 text-gray-500 hover:border-red-500 hover:text-red-500"
          }`}
          title="В избранное"
        >
          <Heart size={24} fill={isFav ? "currentColor" : "none"} />
        </button>

        <div className="flex items-center justify-between px-4 py-2 border-2 border-gray-200 dark:border-slate-700 rounded-xl min-w-[120px]">
          <button onClick={() => setQty(Math.max(1, qty - 1))} className="p-1 hover:text-blue-500 text-gray-600 dark:text-gray-300 transition-colors">
            <Minus size={20} />
          </button>
          <span className="font-bold text-lg dark:text-white">{qty}</span>
          <button onClick={() => setQty(qty + 1)} className="p-1 hover:text-blue-500 text-gray-600 dark:text-gray-300 transition-colors">
            <Plus size={20} />
          </button>
        </div>

        <button
          onClick={() => handleAddToCart(false)}
          className="flex-1 py-4 px-6 rounded-xl font-bold text-lg border-2 border-transparent bg-slate-100 dark:bg-slate-800 hover:bg-blue-50 dark:hover:bg-slate-700 hover:border-blue-500 transition-colors flex items-center justify-center gap-2 dark:text-white"
        >
          <ShoppingCart size={22} /> В корзину
        </button>
      </div>

      {/* ВОЗВРАЩЕННАЯ КНОПКА ДОСТАВКИ */}
      <button
        onClick={() => handleAddToCart(true)}
        className="w-full py-4 px-6 rounded-xl font-bold text-lg bg-blue-600 text-white hover:bg-blue-700 neon-hover shadow-lg flex items-center justify-center gap-2"
      >
        <Truck size={22} /> Заказать доставку
      </button>
      <p className="text-xs text-center text-gray-500 dark:text-gray-400 -mt-2 mb-2">* Только для клиентов из других городов (СДЭК, Почта и др.)</p>

      {/* Кнопка брони */}
      <button
        onClick={() => setIsBookingOpen(true)}
        className="w-full py-4 px-6 rounded-xl font-bold text-lg border-2 border-blue-500 text-blue-500 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-slate-800 transition-colors flex items-center justify-center gap-2"
      >
        <Store size={22} /> Забронировать в магазине
      </button>
      <p className="text-xs text-center text-gray-500 dark:text-gray-400 -mt-2">* Забрать самостоятельно в Ангарске или Иркутске</p>

      <BookingModal
        productId={product.id}
        productName={product.name}
        isOpen={isBookingOpen}
        onClose={() => setIsBookingOpen(false)}
      />
    </div>
  );
}