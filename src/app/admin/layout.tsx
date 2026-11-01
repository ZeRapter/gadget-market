import { Suspense } from "react";
import { auth } from "@/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { 
  LayoutDashboard, 
  Package, 
  FolderTree, 
  Tag, 
  ClipboardList, 
  ShoppingCart, 
  RefreshCw, 
  Gamepad2, 
  MonitorSmartphone, 
  Wrench, 
  Search, 
  Users, 
  ArrowLeft,
  Library
} from "lucide-react";

async function AdminAuth({ children }: { children: React.ReactNode }) {
  const session = await auth();
  if (!session || ((session.user as any)?.role !== "ADMIN" && (session.user as any)?.role !== "SELLER")) {
    redirect("/");
  }
  return <>{children}</>;
}

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-gray-100 dark:bg-[#0f172a] flex">
      <aside className="w-64 bg-white dark:bg-slate-900 border-r border-gray-200 dark:border-slate-800 p-6 flex flex-col gap-2 overflow-y-auto custom-scrollbar">
        <div className="mb-8">
          <h1 className="text-xl font-bold text-blue-500">АДМИНКА</h1>
          <p className="text-xs text-gray-500">Gadget Market</p>
        </div>

        <Link href="/admin" className="flex items-center gap-3 p-3 rounded-xl hover:bg-blue-50 dark:hover:bg-slate-800 text-gray-700 dark:text-gray-300 transition-colors">
          <LayoutDashboard size={20} /> Дашборд
        </Link>
        <Link href="/admin/products" className="flex items-center gap-3 p-3 rounded-xl hover:bg-blue-50 dark:hover:bg-slate-800 text-gray-700 dark:text-gray-300 transition-colors">
          <Package size={20} /> Товары
        </Link>
        <Link href="/admin/categories" className="flex items-center gap-3 p-3 rounded-xl hover:bg-blue-50 dark:hover:bg-slate-800 text-gray-700 dark:text-gray-300 transition-colors">
          <FolderTree size={20} /> Категории
        </Link>
        <Link href="/admin/promocodes" className="flex items-center gap-3 p-3 rounded-xl hover:bg-blue-50 dark:hover:bg-slate-800 text-gray-700 dark:text-gray-300 transition-colors">
          <Tag size={20} /> Промокоды
        </Link>
        
        <Link href="/admin/attributes" className="flex items-center gap-3 p-3 rounded-xl hover:bg-blue-50 dark:hover:bg-slate-800 text-gray-700 dark:text-gray-300 transition-colors">
          <Library size={20} /> Справочники
        </Link>

        <div className="my-2 border-t border-gray-200 dark:border-slate-800"></div>

        <Link href="/admin/bookings" className="flex items-center gap-3 p-3 rounded-xl hover:bg-blue-50 dark:hover:bg-slate-800 text-gray-700 dark:text-gray-300 transition-colors">
          <ClipboardList size={20} /> Бронирования
        </Link>
        <Link href="/admin/orders" className="flex items-center gap-3 p-3 rounded-xl hover:bg-blue-50 dark:hover:bg-slate-800 text-gray-700 dark:text-gray-300 transition-colors">
          <ShoppingCart size={20} /> Заказы
        </Link>
        <Link href="/admin/trade-in" className="flex items-center gap-3 p-3 rounded-xl hover:bg-blue-50 dark:hover:bg-slate-800 text-gray-700 dark:text-gray-300 transition-colors">
          <RefreshCw size={20} /> Trade-in
        </Link>
        <Link href="/admin/digital" className="flex items-center gap-3 p-3 rounded-xl hover:bg-blue-50 dark:hover:bg-slate-800 text-gray-700 dark:text-gray-300 transition-colors">
          <Gamepad2 size={20} /> Цифровые товары
        </Link>
        
        <Link href="/admin/digital/plans" className="flex items-center gap-3 p-3 rounded-xl hover:bg-blue-50 dark:hover:bg-slate-800 text-gray-700 dark:text-gray-300 transition-colors">
          <MonitorSmartphone size={20} /> Цены подписок
        </Link>

        <Link href="/admin/repair" className="flex items-center gap-3 p-3 rounded-xl hover:bg-blue-50 dark:hover:bg-slate-800 text-gray-700 dark:text-gray-300 transition-colors">
          <Wrench size={20} /> Прайс на ремонт
        </Link>

        <Link href="/admin/custom-requests" className="flex items-center gap-3 p-3 rounded-xl hover:bg-blue-50 dark:hover:bg-slate-800 text-gray-700 dark:text-gray-300 transition-colors">
          <Search size={20} /> Заказы товаров
        </Link>

        <div className="my-2 border-t border-gray-200 dark:border-slate-800"></div>

        <Link href="/admin/users" className="flex items-center gap-3 p-3 rounded-xl hover:bg-blue-50 dark:hover:bg-slate-800 text-gray-700 dark:text-gray-300 transition-colors">
          <Users size={20} /> Сотрудники
        </Link>

        <div className="mt-auto border-t border-gray-200 dark:border-slate-800 pt-4">
          <Link href="/" className="flex items-center gap-3 p-3 rounded-xl text-gray-500 hover:text-blue-500 transition-colors">
            <ArrowLeft size={20} /> На сайт
          </Link>
        </div>
      </aside>

      <main className="flex-1 p-8">
        <Suspense fallback={<div className="flex items-center justify-center h-64 text-gray-500">Проверка доступа...</div>}>
          <AdminAuth>{children}</AdminAuth>
        </Suspense>
      </main>
    </div>
  );
}