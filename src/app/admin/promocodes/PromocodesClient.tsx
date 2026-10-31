"use client";

import { useState, useEffect } from "react";
import { Plus, Trash2, Tag, Loader2, Save } from "lucide-react";

export default function PromocodesClient() {
  const [promos, setPromos] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAdding, setIsAdding] = useState(false);
  
  const [code, setCode] = useState("");
  const [discountType, setDiscountType] = useState<"pct" | "amt">("pct");
  const [discountValue, setDiscountValue] = useState("");
  const [expiresAt, setExpiresAt] = useState("");
  
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/admin/promocodes")
      .then(res => res.json())
      .then(data => { if (Array.isArray(data)) setPromos(data); })
      .finally(() => setLoading(false));
  }, []);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = {
        code,
        discountPct: discountType === "pct" ? discountValue : null,
        discountAmt: discountType === "amt" ? discountValue : null,
        expiresAt: expiresAt || null,
      };

      const res = await fetch("/api/admin/promocodes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        const added = await res.json();
        setPromos([added, ...promos]);
        setIsAdding(false);
        setCode(""); setDiscountValue(""); setExpiresAt("");
      } else {
        const err = await res.json();
        alert(err.error || "Ошибка");
      }
    } catch (e) { alert("Ошибка сети"); } finally { setSaving(false); }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Удалить промокод?")) return;
    setDeletingId(id);
    try {
      const res = await fetch(`/api/admin/promocodes/${id}`, { method: "DELETE" });
      if (res.ok) setPromos(promos.filter(p => p.id !== id));
    } catch (e) { alert("Ошибка"); } finally { setDeletingId(null); }
  };

  if (loading) return <div className="p-8 text-center">Загрузка...</div>;

  return (
    <div className="space-y-6">
      <button onClick={() => setIsAdding(!isAdding)} className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-xl font-medium hover:bg-blue-600 transition-colors">
        <Plus size={18} /> Создать промокод
      </button>

      {isAdding && (
        <form onSubmit={handleAdd} className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-gray-200 dark:border-slate-800 flex flex-wrap gap-4 items-end">
          <div>
            <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">Код (латиницей)</label>
            <input required value={code} onChange={e => setCode(e.target.value)} placeholder="SALE2024" className="p-2 border rounded-lg dark:bg-slate-800 dark:border-slate-700 dark:text-white uppercase" />
          </div>
          
          <div>
            <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">Тип скидки</label>
            <select value={discountType} onChange={e => setDiscountType(e.target.value as "pct" | "amt")} className="p-2 border rounded-lg dark:bg-slate-800 dark:border-slate-700 dark:text-white">
              <option value="pct">Процент (%)</option>
              <option value="amt">Сумма (₽)</option>
            </select>
          </div>

          <div>
            <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">Размер</label>
            <input required type="number" value={discountValue} onChange={e => setDiscountValue(e.target.value)} className="p-2 border rounded-lg dark:bg-slate-800 dark:border-slate-700 dark:text-white w-24" />
          </div>

          <div>
            <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">Действует до (необязательно)</label>
            <input type="date" value={expiresAt} onChange={e => setExpiresAt(e.target.value)} className="p-2 border rounded-lg dark:bg-slate-800 dark:border-slate-700 dark:text-white" />
          </div>

          <button type="submit" disabled={saving} className="px-4 py-2 bg-green-500 text-white rounded-lg font-bold hover:bg-green-600 h-10 disabled:opacity-50">
            {saving ? "Сохранение..." : "Сохранить"}
          </button>
        </form>
      )}

      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-gray-200 dark:border-slate-800 overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-gray-50 dark:bg-slate-800/50 border-b text-xs font-semibold text-gray-500 uppercase">
              <th className="p-4">Код</th>
              <th className="p-4">Скидка</th>
              <th className="p-4">Действует до</th>
              <th className="p-4 text-right">Действия</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 dark:divide-slate-800">
            {promos.length === 0 ? (
              <tr><td colSpan={4} className="p-8 text-center text-gray-500">Промокодов пока нет</td></tr>
            ) : (
              promos.map(promo => (
                <tr key={promo.id} className="hover:bg-gray-50 dark:hover:bg-slate-800/30">
                  <td className="p-4 font-bold text-gray-900 dark:text-white flex items-center gap-2">
                    <Tag size={16} className="text-blue-500" /> {promo.code}
                  </td>
                  <td className="p-4 font-bold text-green-500">
                    {promo.discountPct ? `${promo.discountPct} %` : `${promo.discountAmt} ₽`}
                  </td>
                  <td className="p-4 text-gray-500 text-sm">
                    {promo.expiresAt ? new Date(promo.expiresAt).toLocaleDateString('ru-RU') : "Бессрочно"}
                  </td>
                  <td className="p-4 text-right">
                    <button onClick={() => handleDelete(promo.id)} disabled={deletingId === promo.id} className="text-red-500 p-2 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors">
                      {deletingId === promo.id ? <Loader2 size={18} className="animate-spin" /> : <Trash2 size={18} />}
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}