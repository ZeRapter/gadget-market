import { Suspense } from "react";
import { auth } from "@/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { LayoutDashboard, Package, ShoppingCart, Users, ArrowLeft, FolderTree } from "lucide-react";

// Выносим проверку сессии в отдельный асинхронный компонент
async function AdminAuth({ children }: { children: React.ReactNode }) {
  const session = await auth();

  // Проверка: если не админ и не продавец — выкидываем на главную
  if (!session || (session.user as any)?.role !== "ADMIN" && (session.user as any)?.role !== "SELLER") {
    redirect("/");
  }

  return <>{children}</>;
}

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-gray-100 dark:bg-[#0f172a] flex">
      {/* Боковое меню */}
      <aside className="w-64 bg-white dark:bg-slate-900 border-r border-gray-200 dark:border-slate-800 p-6 flex flex-col gap-2">
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
        
        {/* ВОТ ОНА - ССЫЛКА НА КАТЕГОРИИ */}
        <Link href="/admin/categories" className="flex items-center gap-3 p-3 rounded-xl hover:bg-blue-50 dark:hover:bg-slate-800 text-gray-700 dark:text-gray-300 transition-colors">
          <FolderTree size={20} /> Категории
        </Link>

        <Link href="/admin/orders" className="flex items-center gap-3 p-3 rounded-xl hover:bg-blue-50 dark:hover:bg-slate-800 text-gray-700 dark:text-gray-300 transition-colors">
          <ShoppingCart size={20} /> Заказы
        </Link>
        <Link href="/admin/users" className="flex items-center gap-3 p-3 rounded-xl hover:bg-blue-50 dark:hover:bg-slate-800 text-gray-700 dark:text-gray-300 transition-colors">
          <Users size={20} /> Сотрудники
        </Link>

        <div className="mt-auto border-t border-gray-200 dark:border-slate-800 pt-4">
          <Link href="/" className="flex items-center gap-3 p-3 rounded-xl text-gray-500 hover:text-blue-500 transition-colors">
            <ArrowLeft size={20} /> На сайт
          </Link>
        </div>
      </aside>

      {/* Контентная часть (обернута в Suspense) */}
      <main className="flex-1 p-8">
        <Suspense fallback={
          <div className="flex items-center justify-center h-64 text-gray-500">
            Проверка доступа...
          </div>
        }>
          <AdminAuth>
            {children}
          </AdminAuth>
        </Suspense>
      </main>
    </div>
  );
}