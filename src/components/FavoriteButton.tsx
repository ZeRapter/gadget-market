"use client";

import { Heart } from "lucide-react";
import { useFavorites } from "@/context/FavoritesContext";

export default function FavoriteButton({ productId }: { productId: string }) {
  const { isFavorite, toggleFavorite } = useFavorites();
  const isFav = isFavorite(productId);

  return (
    <button
      onClick={() => toggleFavorite(productId)}
      className={`p-3 rounded-full border-2 transition-all shrink-0 flex items-center justify-center ${
        isFav
          ? "border-red-500 bg-red-50 text-red-500 dark:bg-red-900/20"
          : "border-gray-200 dark:border-slate-700 text-gray-400 hover:text-red-500 hover:border-red-500 hover:bg-red-50 dark:hover:bg-red-900/20"
      }`}
      title={isFav ? "Удалить из избранного" : "Добавить в избранное"}
    >
      <Heart size={24} fill={isFav ? "currentColor" : "none"} />
    </button>
  );
}