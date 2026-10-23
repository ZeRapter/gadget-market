"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Save, ArrowLeft } from "lucide-react";
import Link from "next/link";

export default function CategoryForm({ categories, parentId }: { categories: any[], parentId?: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [name, setName] = useState("");
  // Если parentId передан, используем его, иначе пустая строка (главная категория)
  const [selectedParent, setSelectedParent] = useState(parentId || "");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch("/api/admin/categories", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, parentId: selectedParent || null }),
      });

      if (res.ok) {
        // Если создали подкатегорию, возвращаемся в родительскую папку, иначе в корень
        if (selectedParent) {
          router.push(`/admin/categories/${selectedParent}`);
        } else {
          router.push("/admin/categories");
        }
        router.refresh();
      } else {
        alert("Ошибка при создании категории");
      }
    } catch (error) {
      alert("Ошибка сети");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white dark:bg-slate-900 p-8 rounded-2xl shadow-sm border border-gray-200 dark:border-slate-800 space-y-6">
      
      <div>
        <label className="block text-sm font-medium mb-2 dark:text-gray-300">Название категории</label>
        <input required type="text" value={name} onChange={e => setName(e.target.value)} className="w-full p-3 rounded-xl border dark:border-slate-700 bg-transparent dark:text-white focus:ring-2 focus:ring-blue-500 outline-none" placeholder="Например: Xbox" />
      </div>

      {/* Показываем выбор родителя, ТОЛЬКО если parentId не был передан изначально */}
      {!parentId && (
        <div>
          <label className="block text-sm font-medium mb-2 dark:text-gray-300">Родительская категория (если это подгруппа)</label>
          <select value={selectedParent} onChange={e => setSelectedParent(e.target.value)} className="w-full p-3 rounded-xl border dark:border-slate-700 bg-transparent dark:text-white focus:ring-2 focus:ring-blue-500 outline-none">
            <option value="" className="dark:bg-slate-800">-- Сделать главной категорией --</option>
            {categories.map(c => (
              <option key={c.id} value={c.id} className="dark:bg-slate-800">{c.name}</option>
            ))}
          </select>
        </div>
      )}

      <div className="pt-4 border-t border-gray-200 dark:border-slate-800 flex justify-between items-center">
        <Link 
          href={parentId ? `/admin/categories/${parentId}` : "/admin/categories"} 
          className="text-gray-500 hover:text-gray-900 dark:hover:text-white flex items-center gap-1 text-sm font-medium"
        >
          <ArrowLeft size={16} /> Отмена
        </Link>
        <button disabled={loading} type="submit" className="flex items-center gap-2 px-8 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-medium transition-colors disabled:opacity-50">
          <Save size={20} />
          {loading ? "Сохранение..." : "Создать"}
        </button>
      </div>
    </form>
  );
}