"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { Heart, X } from "lucide-react";

type FavoritesContextType = {
  favorites: string[];
  toggleFavorite: (productId: string) => Promise<void>;
  isFavorite: (productId: string) => boolean;
  loading: boolean;
};

const FavoritesContext = createContext<FavoritesContextType | undefined>(undefined);

export function FavoritesProvider({ children }: { children: ReactNode }) {
  const { data: session, status } = useSession();
  const [favorites, setFavorites] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAuthToast, setShowAuthToast] = useState(false);
  const [hasShownToast, setHasShownToast] = useState(false);

  useEffect(() => {
    if (status === "loading") return;

    if (session?.user) {
      // Пользователь авторизован: проверяем, есть ли что-то в localStorage
      const guestFavsStr = localStorage.getItem("guest_favorites");
      const guestFavs = guestFavsStr ? JSON.parse(guestFavsStr) : [];

      if (guestFavs.length > 0) {
        // Переносим гостевые товары в БД
        fetch("/api/favorites/merge", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ productIds: guestFavs }),
        })
          .then(() => {
            localStorage.removeItem("guest_favorites"); // Очищаем память браузера
            return fetch("/api/favorites").then(res => res.json());
          })
          .then(data => {
            if (Array.isArray(data)) setFavorites(data);
          })
          .finally(() => setLoading(false));
      } else {
        // Загружаем из БД
        fetch("/api/favorites")
          .then(res => res.json())
          .then(data => {
            if (Array.isArray(data)) setFavorites(data);
          })
          .finally(() => setLoading(false));
      }
    } else {
      // Гость: загружаем из localStorage
      const guestFavs = localStorage.getItem("guest_favorites");
      if (guestFavs) {
        try {
          setFavorites(JSON.parse(guestFavs));
        } catch (e) {}
      }
      setLoading(false);
    }
  }, [session, status]);

  const toggleFavorite = async (productId: string) => {
    const isFav = favorites.includes(productId);
    let updatedFavs = [];

    if (isFav) {
      updatedFavs = favorites.filter(id => id !== productId);
    } else {
      updatedFavs = [...favorites, productId];
    }

    setFavorites(updatedFavs);

    if (!session?.user) {
      // ГОСТЬ: сохраняем в localStorage
      localStorage.setItem("guest_favorites", JSON.stringify(updatedFavs));

      // Показываем уведомление 1 раз за сессию
      if (!hasShownToast && !isFav) { // Показываем только при добавлении
        setShowAuthToast(true);
        setHasShownToast(true);
        setTimeout(() => setShowAuthToast(false), 5000);
      }
    } else {
      // АВТОРИЗОВАН: сохраняем в БД
      if (isFav) {
        await fetch(`/api/favorites?productId=${productId}`, { method: "DELETE" });
      } else {
        await fetch("/api/favorites", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ productId }),
        });
      }
    }
  };

  const isFavorite = (productId: string) => favorites.includes(productId);

  return (
    <FavoritesContext.Provider value={{ favorites, toggleFavorite, isFavorite, loading }}>
      {children}

      {/* Уведомление для гостей */}
      {showAuthToast && (
        <div className="fixed bottom-24 md:bottom-10 left-1/2 -translate-x-1/2 z-[999] bg-white/90 dark:bg-slate-800/90 backdrop-blur-xl border border-gray-200 dark:border-slate-700 shadow-2xl rounded-2xl p-4 flex items-center gap-4 animate-slide-up w-[90%] max-w-md">
          <div className="w-10 h-10 bg-red-100 dark:bg-red-900/30 text-red-500 rounded-full flex items-center justify-center shrink-0">
            <Heart size={20} fill="currentColor" />
          </div>
          
          <div className="flex-1">
            <p className="font-bold text-sm text-gray-900 dark:text-white">Добавлено во временное избранное</p>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
              Войдите в аккаунт, чтобы список сохранился навсегда и был доступен с других устройств.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Link 
              href="/login" 
              className="bg-blue-500 hover:bg-blue-600 text-white text-xs font-bold px-4 py-2 rounded-lg transition-colors whitespace-nowrap"
            >
              Войти
            </Link>
            <button 
              onClick={() => setShowAuthToast(false)}
              className="p-1.5 text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 transition-colors"
            >
              <X size={16} />
            </button>
          </div>
        </div>
      )}
    </FavoritesContext.Provider>
  );
}

export function useFavorites() {
  const context = useContext(FavoritesContext);
  if (context === undefined) throw new Error("useFavorites must be used within FavoritesProvider");
  return context;
}