"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Plus, Folder, ChevronRight, FolderTree } from "lucide-react";

type Category = {
  id: string;
  name: string;
  parentId: string | null;
};

export default function AdminCategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchCategories() {
      try {
        const res = await fetch("/api/admin/categories/list");
        if (res.ok) {
          const data = await res.json();
          setCategories(data);
        }
      } catch (error) {
        console.error("Ошибка загрузки категорий", error);
      } finally {
        setLoading(false);
      }
    }
    fetchCategories();
  }, []);

  const rootCategories = categories.filter((c) => c.parentId === null);

  if (loading) {
    return <div className="p-8 text-center text-gray-500">Загрузка категорий...</div>;
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Категории</h1>
          <p className="text-sm text-gray-500 mt-1">Управление структурой каталога</p>
        </div>
        
        <Link 
          href="/admin/categories/new" 
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl transition-colors text-sm font-medium shadow-sm"
        >
          <Plus size={16} /> Главная категория
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
        {rootCategories.map(category => {
          const subCount = categories.filter(c => c.parentId === category.id).length;

          return (
            <Link 
              key={category.id} 
              href={`/admin/categories/${category.id}`} // <--- ВОТ ЗДЕСЬ ПЕРЕХОД
              className="bg-white dark:bg-slate-900 rounded-xl border border-gray-200 dark:border-slate-800 p-3 hover:border-blue-500 hover:shadow-md transition-all group flex items-center justify-between"
            >
              <div className="flex items-center gap-3 overflow-hidden">
                <div className="w-9 h-9 bg-blue-50 dark:bg-blue-900/20 rounded-lg flex items-center justify-center text-blue-500 shrink-0">
                  <Folder size={18} />
                </div>
                <div className="overflow-hidden">
                  <h3 className="font-bold text-sm text-gray-900 dark:text-white group-hover:text-blue-500 transition-colors truncate">
                    {category.name}
                  </h3>
                  <p className="text-[11px] text-gray-500 mt-0.5">
                    Подкатегорий: {subCount}
                  </p>
                </div>
              </div>
              <ChevronRight className="text-gray-300 group-hover:text-blue-500 transition-colors shrink-0" size={16} />
            </Link>
          );
        })}
      </div>
      
      {rootCategories.length === 0 && (
        <div className="flex flex-col items-center justify-center p-12 bg-white dark:bg-slate-900 rounded-2xl border border-gray-200 dark:border-slate-800">
             <FolderTree size={48} className="mb-4 text-gray-300" />
             <p className="text-gray-500 mb-4">У вас пока нет категорий.</p>
             <Link href="/admin/categories/new" className="text-blue-500 hover:underline">Создать первую</Link>
        </div>
      )}
    </div>
  );
}