"use client";

import { useState, useEffect } from "react";
import ProductCard from "@/components/ProductCard";
import { useFavorites } from "@/context/FavoritesContext";
import { Heart } from "lucide-react";
import Link from "next/link";

export default function FavoritesClient() {
  const { favorites, loading: favLoading } = useFavorites();
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (favLoading) return;

    if (favorites.length === 0) {
      setProducts([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    fetch("/api/products/by-ids", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ids: favorites }),
    })
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) {
          // Сортируем товары в том порядке, в котором они лежат в избранном (сначала новые)
          const sorted = favorites.map(id => data.find(p => p.id === id)).filter(Boolean);
          setProducts(sorted);
        }
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [favorites, favLoading]);

  if (loading || favLoading) {
    return <div className="text-center text-gray-500 py-20">Загрузка избранного...</div>;
  }

  if (products.length === 0) {
    return (
      <div className="glass-panel p-12 text-center rounded-3xl flex flex-col items-center">
        <Heart size={64} className="text-gray-300 dark:text-gray-600 mb-4" />
        <h2 className="text-2xl font-bold dark:text-white mb-2">В избранном пока пусто</h2>
        <p className="text-gray-500 dark:text-gray-400 mb-6">Добавляйте товары, нажимая на сердечко, чтобы не потерять их.</p>
        <Link href="/catalog" className="px-6 py-3 bg-gradient-to-r from-blue-500 to-blue-700 text-white rounded-xl font-bold neon-hover shadow-lg">
          Перейти в каталог
        </Link>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-6">
      {products.map((product) => (
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
  );
}