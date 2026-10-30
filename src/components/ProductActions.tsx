"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useCart } from "@/context/CartContext";
import { ShoppingCart, Store, Truck, Check, Search, AlertCircle } from "lucide-react";
import BookingModal from "./BookingModal";
import Link from "next/link";

export default function ProductActions({ product }: { product: any }) {
  const router = useRouter();
  const { addToCart } = useCart();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isAdded, setIsAdded] = useState(false);

  const isOutOfStock = product.availability === "OUT_OF_STOCK";

  const handleAddToCart = () => {
    addToCart({
      id: product.id,
      name: product.name,
      priceCash: product.priceCash,
      priceCard: product.priceCard,
      imageUrl: product.images?.[0],
      quantity: 1
    });
    setIsAdded(true);
    setTimeout(() => setIsAdded(false), 2000); 
  };

  const handleBuyNow = () => {
    addToCart({
      id: product.id,
      name: product.name,
      priceCash: product.priceCash,
      priceCard: product.priceCard,
      imageUrl: product.images?.[0],
      quantity: 1
    });
    router.push("/checkout");
  };

  // ЕСЛИ ТОВАРА НЕТ В НАЛИЧИИ
  if (isOutOfStock) {
    return (
      <div className="flex flex-col gap-3 mt-6 p-6 bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-900/50 rounded-2xl">
        <h3 className="font-bold text-orange-800 dark:text-orange-400 flex items-center gap-2 text-lg">
          <AlertCircle size={20} /> Нет в наличии
        </h3>
        <p className="text-sm text-orange-700 dark:text-orange-300 mb-2">
          Этого товара сейчас нет ни в одном из филиалов. Но мы можем попробовать найти его для вас!
        </p>
        <Link 
          href={`/custom-request?product=${encodeURIComponent(product.name)}`}
          className="w-full flex items-center justify-center gap-2 py-4 bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-xl font-bold text-lg hover:opacity-90 transition-opacity shadow-lg"
        >
          <Search size={22} /> Заказать этот товар
        </Link>
      </div>
    );
  }

  // ЕСЛИ ТОВАР ЕСТЬ В НАЛИЧИИ
  return (
    <div className="flex flex-col gap-3 mt-6">
      <div className="flex flex-col">
        <button onClick={handleBuyNow} className="w-full flex items-center justify-center gap-2 py-4 bg-gradient-to-r from-blue-500 to-blue-700 text-white rounded-xl font-bold text-lg neon-hover shadow-lg">
          <Truck size={22} /> Заказать доставку
        </button>
        <p className="text-[11px] text-center text-gray-500 dark:text-gray-400 mt-1">* Только для клиентов из других городов (СДЭК, Почта и др.)</p>
      </div>

      <div className="flex flex-col">
        <button onClick={() => setIsModalOpen(true)} className="w-full flex items-center justify-center gap-2 py-4 bg-white dark:bg-slate-800 border-2 border-blue-500 text-blue-500 dark:text-blue-400 rounded-xl font-bold text-lg hover:bg-blue-50 dark:hover:bg-slate-700 transition-colors">
          <Store size={22} /> Забронировать в магазине
        </button>
        <p className="text-[11px] text-center text-gray-500 dark:text-gray-400 mt-1">* Забрать самостоятельно в Ангарске или Иркутске</p>
      </div>

      <button 
        onClick={handleAddToCart} 
        className={`w-full flex items-center justify-center gap-2 py-4 rounded-xl font-bold text-lg transition-colors border-2 ${
          isAdded 
            ? 'bg-green-500 border-green-500 text-white' 
            : 'bg-transparent border-gray-300 dark:border-slate-500 text-gray-700 dark:text-white hover:border-blue-500 dark:hover:border-blue-400 hover:text-blue-500 dark:hover:text-blue-400'
        }`}
      >
        {isAdded ? <Check size={22} /> : <ShoppingCart size={22} />}
        {isAdded ? "Добавлено!" : "Добавить в корзину"}
      </button>

      <BookingModal 
        productId={product.id} 
        productName={product.name} 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
      />
    </div>
  );
}