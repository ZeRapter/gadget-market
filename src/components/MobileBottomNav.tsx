"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Menu, ShoppingCart, User, Heart } from "lucide-react";
import { useCart } from "@/context/CartContext";
import { useSession } from "next-auth/react";

export default function MobileBottomNav() {
  const pathname = usePathname();
  const { cartCount } = useCart();
  const { data: session } = useSession();

  if (pathname.startsWith("/admin")) return null;

  const isActive = (path: string) => pathname === path;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-[80] md:hidden">
      <div className="bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl border-t border-gray-200 dark:border-slate-800 pb-safe">
        <div className="flex justify-around items-center h-16 px-1">
          
          <Link href="/" className={`flex flex-col items-center justify-center w-full h-full gap-1 transition-colors ${isActive("/") ? "text-blue-500" : "text-gray-500 dark:text-gray-400 hover:text-blue-500"}`}>
            <Home size={22} />
            <span className="text-[10px] font-medium">Главная</span>
          </Link>

          <Link href="/catalog" className={`flex flex-col items-center justify-center w-full h-full gap-1 transition-colors ${isActive("/catalog") ? "text-blue-500" : "text-gray-500 dark:text-gray-400 hover:text-blue-500"}`}>
            <Menu size={22} />
            <span className="text-[10px] font-medium">Каталог</span>
          </Link>

          {/* НОВАЯ КНОПКА ИЗБРАННОГО */}
          <Link href="/favorites" className={`flex flex-col items-center justify-center w-full h-full gap-1 transition-colors ${isActive("/favorites") ? "text-blue-500" : "text-gray-500 dark:text-gray-400 hover:text-blue-500"}`}>
            <Heart size={22} />
            <span className="text-[10px] font-medium">Избранное</span>
          </Link>

          <Link href="/cart" className={`flex flex-col items-center justify-center w-full h-full gap-1 transition-colors relative ${isActive("/cart") ? "text-blue-500" : "text-gray-500 dark:text-gray-400 hover:text-blue-500"}`}>
            <div className="relative">
              <ShoppingCart size={22} />
              {cartCount > 0 && (
                <span className="absolute -top-1.5 -right-2 bg-red-500 text-white text-[9px] font-bold w-4 h-4 flex items-center justify-center rounded-full">
                  {cartCount}
                </span>
              )}
            </div>
            <span className="text-[10px] font-medium">Корзина</span>
          </Link>

          <Link href={session ? "/profile" : "/login"} className={`flex flex-col items-center justify-center w-full h-full gap-1 transition-colors ${isActive("/profile") || isActive("/login") ? "text-blue-500" : "text-gray-500 dark:text-gray-400 hover:text-blue-500"}`}>
            <User size={22} />
            <span className="text-[10px] font-medium">{session ? "Профиль" : "Войти"}</span>
          </Link>

        </div>
      </div>
    </div>
  );
}