"use client";

import Link from "next/link";
import { Search, Heart, ShoppingCart, User, Moon, Sun, LogOut, UserCircle, LayoutDashboard, Menu, X } from "lucide-react";
import { useTheme } from "next-themes";
import { useEffect, useState, useRef } from "react";
import { useSession, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import MegaMenu, { Category } from "./MegaMenu";
import { useCart } from "@/context/CartContext"; 

export default function Header() {
  const { theme, setTheme } = useTheme();
  const { data: session, status } = useSession();
  const { cartCount } = useCart(); 
  const router = useRouter(); 
  
  const [mounted, setMounted] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false); 
  
  // Стейты для живого поиска
  const [searchQuery, setSearchQuery] = useState("");
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);
  
  const menuTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    setMounted(true);
    fetch("/api/categories")
      .then(res => res.json())
      .then(data => setCategories(data))
      .catch(err => console.error(err));
  }, []);

  useEffect(() => {
    if (searchQuery.trim().length < 2) {
      setSuggestions([]);
      return;
    }

    const timer = setTimeout(() => {
      fetch(`/api/search?q=${encodeURIComponent(searchQuery.trim())}`)
        .then(res => res.json())
        .then(data => {
          if (Array.isArray(data)) {
            setSuggestions(data.slice(0, 6));
          }
        })
        .catch(console.error);
    }, 300);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setIsSearchFocused(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
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

  const closeMobileMenu = () => setIsMobileMenuOpen(false);

  const handleSearch = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
      setIsMobileMenuOpen(false); 
      setIsSearchFocused(false);
    }
  };

  return (
    <>
      <header className="glass-panel sticky top-4 z-50 rounded-2xl mx-auto max-w-7xl px-4 sm:px-6 py-3 mb-6">
        <div className="flex justify-between items-center gap-2 sm:gap-4 lg:gap-6 relative">
          
          {/* ЛОГОТИП */}
          <div className="shrink-0 z-10">
            <Link href="/" className="group transition-all duration-300 hover:scale-105 block rounded-full">
              <img src="/logo.png" alt="Gadget Market" className="w-10 h-10 sm:w-14 sm:h-14 lg:w-16 lg:h-16 rounded-full object-cover border-2 border-transparent group-hover:border-blue-400 transition-colors" />
            </Link>
          </div>

          {/* ДЕСКТОПНОЕ МЕНЮ (СЖИМАЕТСЯ ПРИ ФОКУСЕ ПОИСКА) */}
          <div 
            className={`hidden lg:flex items-center shrink-0 transition-all duration-300 overflow-hidden ${
              isSearchFocused ? "max-w-0 opacity-0 pointer-events-none gap-0 mr-0" : "max-w-[600px] opacity-100 gap-4 xl:gap-6 mr-2"
            }`}
          >
            <div className="relative" onMouseEnter={handleMouseEnter} onMouseLeave={handleMouseLeave}>
              <button className="flex items-center gap-2 font-bold text-gray-700 dark:text-gray-200 hover:text-blue-500 transition-colors py-2 whitespace-nowrap">
                <Menu size={20} /> Каталог
              </button>
              {isMenuOpen && categories.length > 0 && (
                <div className="absolute top-full left-0 pt-2 z-50">
                  <div className="bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl border border-white/20 dark:border-slate-700 shadow-2xl rounded-2xl">
                    <MegaMenu categories={categories} />
                  </div>
                </div>
              )}
            </div>
            <Link href="/digital" className="font-bold text-gray-700 dark:text-gray-200 hover:text-blue-500 transition-colors py-2 text-sm xl:text-base whitespace-nowrap">Подписки</Link>
            <Link href="/trade-in" className="font-bold text-gray-700 dark:text-gray-200 hover:text-blue-500 transition-colors py-2 text-sm xl:text-base whitespace-nowrap">Trade-in</Link>
            <Link href="/repair" className="font-bold text-gray-700 dark:text-gray-200 hover:text-blue-500 transition-colors py-2 text-sm xl:text-base whitespace-nowrap">Ремонт</Link>
            <Link href="/custom-request" className="font-bold text-gray-700 dark:text-gray-200 hover:text-blue-500 transition-colors py-2 text-sm xl:text-base whitespace-nowrap">Заказать</Link>
            <Link href="/about" className="font-bold text-gray-700 dark:text-gray-200 hover:text-blue-500 transition-colors py-2 text-sm xl:text-base whitespace-nowrap">О нас</Link>
          </div>

          {/* ЖИВОЙ ПОИСК (РАСШИРЯЕТСЯ ПРИ ФОКУСЕ) */}
          <div 
            className={`flex-1 relative hidden sm:block transition-all duration-300 ${
              isSearchFocused ? "max-w-4xl z-[100]" : "max-w-xl"
            }`} 
            ref={searchRef}
          >
            <form onSubmit={handleSearch} className="relative">
              <input 
                type="text" 
                placeholder="Поиск по названию или артикулу..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onFocus={() => setIsSearchFocused(true)}
                className="w-full bg-white/50 dark:bg-black/30 border border-white/40 dark:border-slate-700 rounded-xl py-2 px-3 pl-10 sm:py-2.5 sm:px-4 sm:pl-11 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all text-sm dark:text-white" 
              />
              <Search 
                onClick={handleSearch}
                className="absolute left-3 top-2.5 sm:top-3 text-gray-500 dark:text-gray-400 cursor-pointer hover:text-blue-500 transition-colors" 
                size={18} 
              />
            </form>

            {/* ВЫПАДАЮЩИЙ СПИСОК ПОДСКАЗОК (ФИКСИРОВАННАЯ ШИРИНА 550PX) */}
            {isSearchFocused && searchQuery.length >= 2 && (
              <div className="absolute top-full left-1/2 -translate-x-1/2 mt-2 w-[95vw] sm:w-[550px] bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl border border-gray-200 dark:border-slate-700 shadow-2xl rounded-2xl overflow-hidden z-[100]">
                {suggestions.length > 0 ? (
                  <div className="flex flex-col p-2">
                    {suggestions.map((product) => (
                      <Link 
                        key={product.id} 
                        href={`/product/${product.id}`}
                        onClick={() => setIsSearchFocused(false)}
                        className="flex items-center gap-4 p-3 hover:bg-gray-50 dark:hover:bg-slate-800 rounded-xl transition-colors border-b border-gray-100 dark:border-slate-800 last:border-0"
                      >
                        <div className="w-14 h-14 shrink-0 bg-white dark:bg-slate-800 rounded-lg overflow-hidden flex items-center justify-center border border-gray-100 dark:border-slate-700">
                           {product.images?.[0] ? (
                             <img src={product.images[0]} alt="" className="w-full h-full object-contain p-1 mix-blend-multiply dark:mix-blend-normal" />
                           ) : (
                             <Search size={20} className="text-gray-400" />
                           )}
                        </div>
                        {/* min-w-0 не дает тексту распирать флекс-контейнер, truncate делает многоточие */}
                        <div className="flex-1 min-w-0">
                          <p className="text-sm sm:text-base font-bold text-gray-900 dark:text-white truncate">{product.name}</p>
                          <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5 truncate">Артикул: {product.sku}</p>
                        </div>
                        <div className="font-bold text-blue-500 text-sm sm:text-lg shrink-0 whitespace-nowrap ml-2">
                          {(product.priceCash / 100).toLocaleString('ru-RU')} ₽
                        </div>
                      </Link>
                    ))}
                  </div>
                ) : (
                  <div className="p-6 text-center text-sm text-gray-500 dark:text-gray-400">
                    По запросу «{searchQuery}» ничего не найдено.
                  </div>
                )}
              </div>
            )}
          </div>

          {/* ИКОНКИ СПРАВА */}
          <div className="flex items-center gap-2 sm:gap-3 lg:gap-4 shrink-0 z-10">
            <button onClick={() => setTheme(theme === "dark" ? "light" : "dark")} className="hidden sm:block text-gray-600 dark:text-gray-300 hover:text-blue-500 transition-colors" title="Сменить тему">
              {theme === "dark" ? <Sun size={20} /> : <Moon size={20} />}
            </button>
            
            <Link href="/favorites" className="hidden sm:block text-gray-600 dark:text-gray-300 hover:text-blue-500 transition-colors relative" title="Избранное">
              <Heart size={20} className="sm:w-[22px] sm:h-[22px]" />
            </Link>

            <Link href="/cart" className="text-gray-600 dark:text-gray-300 hover:text-blue-500 transition-colors relative" title="Корзина">
              <ShoppingCart size={20} className="sm:w-[22px] sm:h-[22px]" />
              {cartCount > 0 && (
                <span className="absolute -top-2 -right-2 bg-red-500 text-white text-[9px] sm:text-[10px] font-bold w-4 h-4 sm:w-5 sm:h-5 flex items-center justify-center rounded-full shadow-md animate-pulse">
                  {cartCount}
                </span>
              )}
            </Link>

            {/* АККАУНТ (ДЕСКТОП) */}
            <div className="hidden md:flex items-center gap-3">
              {status === "loading" ? (
                 <div className="w-24 h-10 bg-gray-200 dark:bg-slate-800 animate-pulse rounded-lg"></div>
              ) : session ? (
                <>
                  {isAdmin && (
                    <Link href="/admin" className="hidden xl:flex items-center gap-2 px-4 py-2 rounded-lg bg-slate-800 dark:bg-slate-700 text-white hover:bg-slate-700 transition-colors text-sm font-medium shadow-md">
                      <LayoutDashboard size={18} /> Админка
                    </Link>
                  )}
                  <Link href="/profile" className="hidden lg:flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-blue-500 transition-colors">
                    <UserCircle size={22} />
                    {session.user?.name?.split(' ')[0] || "Профиль"}
                  </Link>
                  <button onClick={() => signOut({ callbackUrl: '/' })} className="p-2 rounded-lg bg-red-100 text-red-600 hover:bg-red-200 dark:bg-red-900/30 dark:text-red-400 transition-colors" title="Выйти">
                    <LogOut size={18} />
                  </button>
                </>
              ) : (
                <Link href="/login" className="hidden md:flex items-center gap-2 px-4 py-2 rounded-lg bg-gradient-to-r from-blue-500 to-blue-700 text-white neon-hover text-sm font-medium">
                  <User size={18} /> Войти
                </Link>
              )}
            </div>

            {/* КНОПКА БУРГЕР (МОБИЛЬНАЯ) */}
            <button onClick={() => setIsMobileMenuOpen(true)} className="lg:hidden p-1 sm:p-2 text-gray-700 dark:text-gray-200 hover:text-blue-500 transition-colors">
              <Menu size={24} className="sm:w-7 sm:h-7" />
            </button>
          </div>
        </div>
      </header>

      {/* МОБИЛЬНОЕ ВЫЕЗЖАЮЩЕЕ МЕНЮ (БЕЗ ИЗМЕНЕНИЙ) */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[90] lg:hidden transition-opacity" onClick={closeMobileMenu} />
      )}

      <div className={`fixed top-0 right-0 h-full w-[300px] bg-white dark:bg-slate-900 z-[100] shadow-2xl transform transition-transform duration-300 ease-in-out lg:hidden flex flex-col ${isMobileMenuOpen ? 'translate-x-0' : 'translate-x-full'}`}>
        <div className="flex items-center justify-between p-5 border-b border-gray-200 dark:border-slate-800">
          <span className="font-bold text-lg dark:text-white">Меню</span>
          <button onClick={closeMobileMenu} className="p-2 text-gray-500 hover:text-red-500 transition-colors">
            <X size={24} />
          </button>
        </div>
        
        <div className="flex-1 overflow-y-auto p-5 flex flex-col gap-2">
          
          <div className="relative mb-4">
            <form onSubmit={handleSearch}>
              <input 
                type="text" 
                placeholder="Поиск..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-gray-100 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl py-2 px-3 pl-9 text-sm dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <Search onClick={handleSearch} className="absolute left-2.5 top-2.5 text-gray-500 cursor-pointer hover:text-blue-500" size={16} />
            </form>
          </div>

          <Link href="/catalog" onClick={closeMobileMenu} className="p-3 rounded-xl hover:bg-gray-100 dark:hover:bg-slate-800 text-gray-800 dark:text-gray-200 font-medium transition-colors">Каталог</Link>
          <Link href="/digital" onClick={closeMobileMenu} className="p-3 rounded-xl hover:bg-gray-100 dark:hover:bg-slate-800 text-gray-800 dark:text-gray-200 font-medium transition-colors">Подписки/Игры</Link>
          <Link href="/trade-in" onClick={closeMobileMenu} className="p-3 rounded-xl hover:bg-gray-100 dark:hover:bg-slate-800 text-gray-800 dark:text-gray-200 font-medium transition-colors">Trade-in</Link>
          <Link href="/repair" onClick={closeMobileMenu} className="p-3 rounded-xl hover:bg-gray-100 dark:hover:bg-slate-800 text-gray-800 dark:text-gray-200 font-medium transition-colors">Ремонт</Link>
          <Link href="/custom-request" onClick={closeMobileMenu} className="p-3 rounded-xl hover:bg-gray-100 dark:hover:bg-slate-800 text-gray-800 dark:text-gray-200 font-medium transition-colors">Заказать товар</Link>
          <Link href="/about" onClick={closeMobileMenu} className="p-3 rounded-xl hover:bg-gray-100 dark:hover:bg-slate-800 text-gray-800 dark:text-gray-200 font-medium transition-colors">О нас</Link>

          <div className="border-t border-gray-200 dark:border-slate-800 my-4"></div>

          {session ? (
            <div className="flex flex-col gap-2">
              <Link href="/profile" onClick={closeMobileMenu} className="flex items-center gap-3 p-3 rounded-xl hover:bg-gray-100 dark:hover:bg-slate-800 transition-colors">
                <UserCircle size={20} className="text-blue-500" />
                <span className="font-medium dark:text-white">Мой профиль</span>
              </Link>
              {isAdmin && (
                <Link href="/admin" onClick={closeMobileMenu} className="flex items-center gap-3 p-3 rounded-xl bg-slate-800 text-white hover:bg-slate-700 transition-colors">
                  <LayoutDashboard size={20} />
                  <span className="font-medium">Админка</span>
                </Link>
              )}
              <button onClick={() => { signOut({ callbackUrl: '/' }); closeMobileMenu(); }} className="flex items-center gap-3 p-3 rounded-xl text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors text-left">
                <LogOut size={20} />
                <span className="font-medium">Выйти</span>
              </button>
            </div>
          ) : (
            <Link href="/login" onClick={closeMobileMenu} className="flex items-center justify-center gap-2 w-full py-3 bg-gradient-to-r from-blue-500 to-blue-700 text-white rounded-xl font-medium transition-colors">
              <User size={18} /> Войти
            </Link>
          )}

          <button onClick={() => setTheme(theme === "dark" ? "light" : "dark")} className="mt-4 flex items-center justify-between w-full p-3 rounded-xl bg-gray-50 dark:bg-slate-800 transition-colors">
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Сменить тему</span>
            {theme === "dark" ? <Sun size={20} className="text-yellow-400" /> : <Moon size={20} className="text-gray-600" />}
          </button>
        </div>
      </div>
    </>
  );
}