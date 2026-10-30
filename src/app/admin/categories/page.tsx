"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Plus, Folder, ChevronRight, FolderTree, Pencil, Trash2, Check, X, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";

type Category = {
  id: string;
  name: string;
  parentId: string | null;
};

export default function AdminCategoriesPage() {
  const router = useRouter();
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Стейты для редактирования
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState("");
  const [savingId, setSavingId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

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

  // Логика сохранения нового названия
  const handleSaveEdit = async (id: string) => {
    if (!editName.trim()) return;
    setSavingId(id);
    try {
      const res = await fetch(`/api/admin/categories/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: editName }),
      });
      
      if (res.ok) {
        const updated = await res.json();
        setCategories(categories.map(c => c.id === id ? updated : c));
        setEditingId(null);
      } else {
        alert("Ошибка при сохранении");
      }
    } catch (e) {
      alert("Ошибка сети");
    } finally {
      setSavingId(null);
    }
  };

  // Логика удаления
  const handleDelete = async (id: string) => {
    if (!confirm("Вы уверены, что хотите удалить эту категорию?")) return;
    
    setDeletingId(id);
    try {
      const res = await fetch(`/api/admin/categories/${id}`, { method: "DELETE" });
      
      if (res.ok) {
        setCategories(categories.filter(c => c.id !== id));
      } else {
        const data = await res.json();
        alert(data.error || "Ошибка при удалении");
      }
    } catch (e) {
      alert("Ошибка сети");
    } finally {
      setDeletingId(null);
    }
  };

  if (loading) {
    return <div className="p-8 text-center text-gray-500 dark:text-gray-400">Загрузка категорий...</div>;
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Категории</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Управление структурой каталога</p>
        </div>
        
        <Link 
          href="/admin/categories/new" 
          className="flex items-center gap-2 px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-xl transition-colors text-sm font-medium shadow-sm"
        >
          <Plus size={16} /> Главная категория
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
        {rootCategories.map(category => {
          const subCount = categories.filter(c => c.parentId === category.id).length;
          const isEditing = editingId === category.id;
          const isSaving = savingId === category.id;
          const isDeleting = deletingId === category.id;

          return (
            <div 
              key={category.id} 
              className={`bg-white dark:bg-slate-900 rounded-xl border transition-all group flex flex-col justify-between ${isEditing ? 'border-blue-500 shadow-md ring-2 ring-blue-500/20' : 'border-gray-200 dark:border-slate-800 hover:border-blue-500 hover:shadow-md'}`}
            >
              <div className="p-3">
                {isEditing ? (
                  // Режим редактирования
                  <div className="flex items-center gap-2">
                    <input 
                      type="text" 
                      value={editName} 
                      onChange={e => setEditName(e.target.value)}
                      className="w-full p-1.5 text-sm border rounded dark:bg-slate-800 dark:border-slate-700 dark:text-white outline-none focus:ring-1 focus:ring-blue-500"
                      autoFocus
                    />
                    <button onClick={() => handleSaveEdit(category.id)} disabled={isSaving} className="p-1.5 text-green-500 hover:bg-green-50 dark:hover:bg-green-900/20 rounded">
                      {isSaving ? <Loader2 className="animate-spin" size={16} /> : <Check size={16} />}
                    </button>
                    <button onClick={() => setEditingId(null)} className="p-1.5 text-gray-400 hover:bg-gray-100 dark:hover:bg-slate-800 rounded">
                      <X size={16} />
                    </button>
                  </div>
                ) : (
                  // Обычный режим
                  <div className="flex items-center justify-between gap-2">
                    <Link 
                      href={`/admin/categories/${category.id}`}
                      className="flex items-center gap-3 overflow-hidden flex-1"
                    >
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
                    </Link>

                    {/* Кнопки действий */}
                    <div className="flex items-center gap-1 opacity-100 lg:opacity-0 group-hover:opacity-100 transition-opacity">
                      <button onClick={() => { setEditingId(category.id); setEditName(category.name); }} className="p-1.5 text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded" title="Редактировать">
                        <Pencil size={16} />
                      </button>
                      <button onClick={() => handleDelete(category.id)} disabled={isDeleting} className="p-1.5 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded" title="Удалить">
                        {isDeleting ? <Loader2 className="animate-spin" size={16} /> : <Trash2 size={16} />}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
      
      {rootCategories.length === 0 && (
        <div className="flex flex-col items-center justify-center p-12 bg-white dark:bg-slate-900 rounded-2xl border border-gray-200 dark:border-slate-800">
             <FolderTree size={48} className="mb-4 text-gray-300 dark:text-gray-600" />
             <p className="text-gray-500 dark:text-gray-400 mb-4">У вас пока нет категорий.</p>
             <Link href="/admin/categories/new" className="text-blue-500 hover:underline">Создать первую</Link>
        </div>
      )}
    </div>
  );
}