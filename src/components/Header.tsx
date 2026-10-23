"use client";

import Link from "next/link";
import { Search, Heart, ShoppingCart, User, Moon, Sun, LogOut, UserCircle, LayoutDashboard } from "lucide-react";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import { useSession, signOut } from "next-auth/react";

export default function Header() {
  const { theme, setTheme } = useTheme();
  const { data: session, status } = useSession();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  // Проверяем, является ли пользователь админом или продавцом
  const userRole = (session?.user as any)?.role;
  const isAdmin = userRole === "ADMIN" || userRole === "SELLER";

  return (
    <header className="glass-panel sticky top-4 z-50 rounded-2xl mx-auto max-w-7xl px-6 py-3 mb-8">
      <div className="flex justify-between items-center gap-6">
        
        {/* Логотип */}
        <Link href="/" className="shrink-0 group transition-all duration-300 hover:scale-110 hover:drop-shadow-[0_0_15px_rgba(30,144,255,0.8)] block rounded-full">
          <img src="/logo.png" alt="Gadget Market" className="w-20 h-20 rounded-full object-cover border-2 border-transparent group-hover:border-blue-400 transition-colors" />
        </Link>

        {/* Поиск */}
        <div className="flex-1 max-w-xl relative">
          <input type="text" placeholder="Поиск по названию или артикулу..." className="w-full bg-white/50 dark:bg-black/30 border border-white/40 rounded-xl py-2.5 px-4 pl-10 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all text-sm dark:text-white" />
          <Search className="absolute left-3 top-3 text-gray-500" size={18} />
        </div>

        {/* Иконки справа */}
        <div className="flex items-center gap-4 shrink-0">
          <button onClick={() => setTheme(theme === "dark" ? "light" : "dark")} className="text-gray-600 dark:text-gray-300 hover:text-blue-500 transition-colors" title="Сменить тему">
            {theme === "dark" ? <Sun size={22} /> : <Moon size={22} />}
          </button>
          <button className="text-gray-600 dark:text-gray-300 hover:text-blue-500 transition-colors relative" title="Избранное">
            <Heart size={22} />
          </button>
          <button className="text-gray-600 dark:text-gray-300 hover:text-blue-500 transition-colors relative" title="Корзина">
            <ShoppingCart size={22} />
          </button>
          
          {/* АККАУНТ И АДМИНКА */}
          {status === "loading" ? (
             <div className="w-24 h-10 bg-gray-200 animate-pulse rounded-lg"></div>
          ) : session ? (
            <div className="flex items-center gap-3">
              
              {/* ВОТ ОНА - КНОПКА АДМИНКИ (видна только админам и продавцам) */}
              {isAdmin && (
                <Link 
                  href="/admin" 
                  className="flex items-center gap-2 px-4 py-2 rounded-lg bg-slate-800 text-white hover:bg-slate-700 transition-colors text-sm font-medium shadow-md mr-1"
                >
                  <LayoutDashboard size={18} />
                  Админка
                </Link>
              )}

              <Link href="/profile" className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-blue-500 transition-colors">
                <UserCircle size={22} />
                {session.user?.name?.split(' ')[0] || "Профиль"}
              </Link>
              <button 
                onClick={() => signOut({ callbackUrl: '/' })}
                className="p-2 rounded-lg bg-red-100 text-red-600 hover:bg-red-200 dark:bg-red-900/30 dark:text-red-400 transition-colors"
                title="Выйти"
              >
                <LogOut size={18} />
              </button>
            </div>
          ) : (
            <Link href="/login" className="flex items-center gap-2 px-5 py-2.5 rounded-lg bg-gradient-to-r from-blue-500 to-blue-700 text-white neon-hover text-sm font-medium">
              <User size={18} />
              Войти
            </Link>
          )}

        </div>
      </div>
    </header>
  );
}