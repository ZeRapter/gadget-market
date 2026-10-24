"use client";

import Link from "next/link";
import { Search, Heart, ShoppingCart, User, Moon, Sun, LogOut, UserCircle, LayoutDashboard, Menu } from "lucide-react";
import { useTheme } from "next-themes";
import { useEffect, useState, useRef } from "react";
import { useSession, signOut } from "next-auth/react";
import MegaMenu, { Category } from "./MegaMenu";
import { useCart } from "@/context/CartContext"; // <-- Импорт корзины

export default function Header() {
  const { theme, setTheme } = useTheme();
  const { data: session, status } = useSession();
  const { cartCount } = useCart(); // <-- Получаем количество товаров
  
  const [mounted, setMounted] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const menuTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    setMounted(true);
    fetch("/api/categories")
      .then(res => res.json())
      .then(data => setCategories(data))
      .catch(err => console.error(err));
  }, []);

  if (!mounted) return null;

  const userRole = (session?.user as any)?.role;
  const isAdmin = userRole === "ADMIN" || userRole === "SELLER";

  const handleMouseEnter = () => {
    if (menuTimeoutRef.current) clearTimeout(menuTimeoutRef.current);
    setIsMenuOpen(true);
  };

  const handleMouseLeave = () => {
    menuTimeoutRef.current = setTimeout(() => {
      setIsMenuOpen(false);
    }, 200); 
  };

  return (
    <header className="glass-panel sticky top-4 z-50 rounded-2xl mx-auto max-w-7xl px-6 py-3 mb-8">
      <div className="flex justify-between items-center gap-6">
        
        <div className="flex items-center gap-6 shrink-0">
          <Link href="/" className="group transition-all duration-300 hover:scale-105 block rounded-full">
            <img src="/logo.png" alt="Gadget Market" className="w-16 h-16 rounded-full object-cover border-2 border-transparent group-hover:border-blue-400 transition-colors" />
          </Link>

          <div 
            className="relative"
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
          >
            <button className="flex items-center gap-2 font-bold text-gray-700 dark:text-gray-200 hover:text-blue-500 transition-colors py-2">
              <Menu size={20} />
              Каталог
            </button>

            {isMenuOpen && categories.length > 0 && (
              <div className="absolute top-full left-0 pt-2 z-50">
                <div className="bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl border border-white/20 dark:border-slate-700 shadow-2xl rounded-2xl">
                  <MegaMenu categories={categories} />
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="flex-1 max-w-xl relative hidden md:block">
          <input type="text" placeholder="Поиск по названию или артикулу..." className="w-full bg-white/50 dark:bg-black/30 border border-white/40 rounded-xl py-2.5 px-4 pl-10 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all text-sm dark:text-white" />
          <Search className="absolute left-3 top-3 text-gray-500" size={18} />
        </div>

        <div className="flex items-center gap-4 shrink-0">
          <button onClick={() => setTheme(theme === "dark" ? "light" : "dark")} className="text-gray-600 dark:text-gray-300 hover:text-blue-500 transition-colors" title="Сменить тему">
            {theme === "dark" ? <Sun size={22} /> : <Moon size={22} />}
          </button>
          <button className="text-gray-600 dark:text-gray-300 hover:text-blue-500 transition-colors relative hidden sm:block" title="Избранное">
            <Heart size={22} />
          </button>
          
          {/* КНОПКА КОРЗИНЫ С БЕЙДЖЕМ */}
          <Link href="/cart" className="text-gray-600 dark:text-gray-300 hover:text-blue-500 transition-colors relative" title="Корзина">
            <ShoppingCart size={22} />
            {cartCount > 0 && (
              <span className="absolute -top-2 -right-2 bg-red-500 text-white text-[10px] font-bold w-5 h-5 flex items-center justify-center rounded-full shadow-md animate-pulse">
                {cartCount}
              </span>
            )}
          </Link>
          
          {status === "loading" ? (
             <div className="w-24 h-10 bg-gray-200 animate-pulse rounded-lg"></div>
          ) : session ? (
            <div className="flex items-center gap-3">
              {isAdmin && (
                <Link href="/admin" className="hidden lg:flex items-center gap-2 px-4 py-2 rounded-lg bg-slate-800 text-white hover:bg-slate-700 transition-colors text-sm font-medium shadow-md mr-1">
                  <LayoutDashboard size={18} /> Админка
                </Link>
              )}
              <Link href="/profile" className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-blue-500 transition-colors hidden sm:flex">
                <UserCircle size={22} />
                {session.user?.name?.split(' ')[0] || "Профиль"}
              </Link>
              <button onClick={() => signOut({ callbackUrl: '/' })} className="p-2 rounded-lg bg-red-100 text-red-600 hover:bg-red-200 dark:bg-red-900/30 dark:text-red-400 transition-colors" title="Выйти">
                <LogOut size={18} />
              </button>
            </div>
          ) : (
            <Link href="/login" className="flex items-center gap-2 px-5 py-2.5 rounded-lg bg-gradient-to-r from-blue-500 to-blue-700 text-white neon-hover text-sm font-medium">
              <User size={18} /> Войти
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}