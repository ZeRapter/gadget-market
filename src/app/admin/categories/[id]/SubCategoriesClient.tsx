"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Folder, ChevronRight, Pencil, Trash2, Check, X, Loader2 } from "lucide-react";

export default function SubCategoriesClient({ initialCategories }: { initialCategories: any[] }) {
  const router = useRouter();
  const [categories, setCategories] = useState(initialCategories);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState("");
  const [loadingId, setLoadingId] = useState<string | null>(null);

  const handleSave = async (id: string) => {
    if (!editName.trim()) return;
    setLoadingId(id);
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
      setLoadingId(null);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Вы уверены, что хотите удалить эту подкатегорию?")) return;
    
    setLoadingId(id);
    try {
      const res = await fetch(`/api/admin/categories/${id}`, { method: "DELETE" });
      
      if (res.ok) {
        setCategories(categories.filter(c => c.id !== id));
        router.refresh(); // Обновляем счетчики на всякий случай
      } else {
        const data = await res.json();
        alert(data.error || "Ошибка при удалении");
      }
    } catch (e) {
      alert("Ошибка сети");
    } finally {
      setLoadingId(null);
    }
  };

  if (categories.length === 0) {
    return (
      <div className="p-4 bg-white dark:bg-slate-900 rounded-xl border border-gray-200 dark:border-slate-800 text-gray-500 text-sm">
        В этой категории пока нет подгрупп.
      </div>
    );
  }

  return (
    <div className="flex flex-wrap gap-2">
      {categories.map(child => {
        const isEditing = editingId === child.id;
        const isLoading = loadingId === child.id;

        return (
          <div key={child.id} className={`bg-white dark:bg-slate-900 border rounded-lg transition-all group flex items-center ${isEditing ? 'border-blue-500 shadow-sm w-full sm:w-auto' : 'border-gray-200 dark:border-slate-800 hover:border-blue-500 hover:shadow-sm'}`}>
            
            {isEditing ? (
              // Режим редактирования
              <div className="p-1.5 flex items-center gap-2">
                <input 
                  type="text" 
                  value={editName} 
                  onChange={e => setEditName(e.target.value)}
                  className="p-1 text-sm border rounded dark:bg-slate-800 dark:border-slate-700 dark:text-white outline-none w-40"
                  autoFocus
                />
                <button onClick={() => handleSave(child.id)} disabled={isLoading} className="p-1 text-green-500 hover:bg-green-50 rounded">
                  {isLoading ? <Loader2 className="animate-spin" size={16} /> : <Check size={16} />}
                </button>
                <button onClick={() => setEditingId(null)} className="p-1 text-gray-400 hover:bg-gray-100 rounded">
                  <X size={16} />
                </button>
              </div>
            ) : (
              // Обычный режим
              <div className="flex items-center w-full pr-1.5">
                <Link 
                  href={`/admin/categories/${child.id}`}
                  className="px-3 py-1.5 flex items-center gap-2"
                >
                  <Folder size={14} className="text-gray-400 group-hover:text-blue-500 transition-colors" />
                  <span className="font-medium text-gray-700 dark:text-gray-300 text-sm group-hover:text-blue-500 transition-colors">{child.name}</span>
                  <ChevronRight size={14} className="text-gray-300 group-hover:text-blue-500 transition-colors ml-1" />
                </Link>
                
                {/* Кнопки действий */}
                <div className="flex items-center gap-1 opacity-100 lg:opacity-0 group-hover:opacity-100 transition-opacity ml-auto">
                  <button onClick={() => { setEditingId(child.id); setEditName(child.name); }} className="p-1 text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded" title="Редактировать">
                    <Pencil size={14} />
                  </button>
                  <button onClick={() => handleDelete(child.id)} disabled={isLoading} className="p-1 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded" title="Удалить">
                    {isLoading ? <Loader2 className="animate-spin" size={14} /> : <Trash2 size={14} />}
                  </button>
                </div>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}