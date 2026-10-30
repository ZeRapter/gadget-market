"use client";

import { useState } from "react";
import { Save, Trash2, Plus, Search, Pencil, X, Filter } from "lucide-react";

const xboxMonths = [
  "1 месяц", "2 месяца", "3 месяца", "4 месяца", "5 месяцев", "6 месяцев", 
  "7 месяцев", "8 месяцев", "9 месяцев", "10 месяцев", "11 месяцев", "12 месяцев", "13 месяцев"
];

export default function PlansAdminClient({ initialPlans }: { initialPlans: any[] }) {
  const [plans, setPlans] = useState(initialPlans);
  const [searchQuery, setSearchQuery] = useState("");
  
  // Стейты для фильтров
  const [filterPlatform, setFilterPlatform] = useState("");
  const [filterRegion, setFilterRegion] = useState("");
  const [filterTier, setFilterTier] = useState("");
  const [filterDuration, setFilterDuration] = useState("");
  const [filterAccountType, setFilterAccountType] = useState(""); // НОВЫЙ ФИЛЬТР

  // Стейты для добавления
  const [isAdding, setIsAdding] = useState(false);
  const [newPlatform, setNewPlatform] = useState("PlayStation");
  const [newRegion, setNewRegion] = useState("Турция");
  const [newTier, setNewTier] = useState("Essential");
  const [newDuration, setNewDuration] = useState("1 месяц");
  const [newAccountType, setNewAccountType] = useState("Действующий");
  const [newPrice, setNewPrice] = useState("");

  // Стейты для редактирования
  const [editingPlan, setEditingPlan] = useState<any>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editForm, setEditForm] = useState({
    id: "", platform: "", region: "", tier: "", duration: "", accountType: "", price: ""
  });

  // Собираем уникальные значения для фильтров
  const availablePlatforms = ["PlayStation", "Xbox"];
  const availableRegions = Array.from(new Set(plans.map(p => p.region).filter(Boolean))).sort();
  const availableTiers = Array.from(new Set(plans.map(p => p.tier))).sort();
  const availableDurations = Array.from(new Set(plans.map(p => p.duration).filter(Boolean))).sort();

  // --- ЛОГИКА ФИЛЬТРАЦИИ ---
  const filteredPlans = plans.filter(plan => {
    const query = searchQuery.toLowerCase();
    const matchesSearch = query === "" || (
      plan.platform.toLowerCase().includes(query) ||
      (plan.region && plan.region.toLowerCase().includes(query)) ||
      plan.tier.toLowerCase().includes(query) ||
      (plan.duration && plan.duration.toLowerCase().includes(query)) ||
      (plan.accountType && plan.accountType.toLowerCase().includes(query)) ||
      plan.price.toString().includes(query)
    );

    const matchesPlatform = filterPlatform === "" || plan.platform === filterPlatform;
    const matchesRegion = filterRegion === "" || plan.region === filterRegion;
    const matchesTier = filterTier === "" || plan.tier === filterTier;
    const matchesDuration = filterDuration === "" || plan.duration === filterDuration;
    const matchesAccountType = filterAccountType === "" || plan.accountType === filterAccountType;

    return matchesSearch && matchesPlatform && matchesRegion && matchesTier && matchesDuration && matchesAccountType;
  });

  const resetFilters = () => {
    setSearchQuery(""); setFilterPlatform(""); setFilterRegion(""); setFilterTier(""); setFilterDuration(""); setFilterAccountType("");
  };

  // --- ДОБАВЛЕНИЕ ---
  const handlePlatformChange = (platform: string, isEdit = false) => {
    if (isEdit) {
      setEditForm(prev => ({ 
        ...prev, 
        platform, 
        tier: platform === "Xbox" ? "Game Pass Ultimate" : "Essential",
        duration: platform === "Xbox" ? "1 месяц" : "1 месяц"
      }));
    } else {
      setNewPlatform(platform);
      setNewTier(platform === "Xbox" ? "Game Pass Ultimate" : "Essential");
      setNewDuration("1 месяц");
    }
  };

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await fetch("/api/admin/subscriptions", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ 
        platform: newPlatform, 
        region: newPlatform === "Xbox" ? "Турция" : newRegion, 
        tier: newTier, 
        duration: newDuration || "1 месяц",
        accountType: newPlatform === "Xbox" ? newAccountType : null,
        price: newPrice 
      }),
    });
    if (res.ok) {
      const addedPlan = await res.json();
      setPlans([...plans, addedPlan].sort((a, b) => a.platform.localeCompare(b.platform)));
      setIsAdding(false);
      setNewDuration("1 месяц");
      setNewPrice("");
    }
  };

  // --- УДАЛЕНИЕ ---
  const handleDelete = async (id: string) => {
    if (!confirm("Удалить этот тариф?")) return;
    const res = await fetch(`/api/admin/subscriptions?id=${id}`, { method: "DELETE" });
    if (res.ok) setPlans(plans.filter(p => p.id !== id));
  };

  // --- РЕДАКТИРОВАНИЕ ---
  const openEditModal = (plan: any) => {
    setEditingPlan(plan);
    setEditForm({
      id: plan.id,
      platform: plan.platform,
      region: plan.region || "Турция",
      tier: plan.tier,
      duration: plan.duration || "1 месяц",
      accountType: plan.accountType || "Действующий",
      price: plan.price.toString()
    });
    setIsEditModalOpen(true);
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await fetch("/api/admin/subscriptions", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        id: editForm.id,
        platform: editForm.platform,
        region: editForm.platform === "Xbox" ? "Турция" : editForm.region,
        tier: editForm.tier,
        duration: editForm.duration || "1 месяц",
        accountType: editForm.platform === "Xbox" ? editForm.accountType : null,
        price: editForm.price
      }),
    });
    
    if (res.ok) {
      const updatedPlan = await res.json();
      setPlans(plans.map(p => p.id === updatedPlan.id ? updatedPlan : p));
      setIsEditModalOpen(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-gray-200 dark:border-slate-800 flex flex-col gap-4">
        
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <button onClick={() => setIsAdding(!isAdding)} className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-xl font-medium hover:bg-blue-600 transition-colors shrink-0">
            <Plus size={18} /> Добавить новый тариф
          </button>

          <div className="relative w-full sm:w-72">
            <Search className="absolute left-3 top-2.5 text-gray-400 dark:text-gray-500" size={18} />
            <input type="text" placeholder="Поиск по тарифам..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="w-full pl-10 pr-4 py-2 bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 dark:text-white" />
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3 pt-2 border-t border-gray-100 dark:border-slate-800">
          <div className="flex items-center gap-1 text-sm text-gray-500 dark:text-gray-400 mr-2"><Filter size={16} /> Фильтры:</div>
          
          <select value={filterPlatform} onChange={e => setFilterPlatform(e.target.value)} className="p-2 text-sm border rounded-lg bg-gray-50 dark:bg-slate-800 dark:border-slate-700 dark:text-white outline-none">
            <option value="">Все платформы</option>
            {availablePlatforms.map(p => <option key={p} value={p}>{p}</option>)}
          </select>

          <select value={filterRegion} onChange={e => setFilterRegion(e.target.value)} className="p-2 text-sm border rounded-lg bg-gray-50 dark:bg-slate-800 dark:border-slate-700 dark:text-white outline-none">
            <option value="">Все регионы</option>
            {availableRegions.map(r => <option key={r} value={r}>{r}</option>)}
          </select>

          <select value={filterAccountType} onChange={e => setFilterAccountType(e.target.value)} className="p-2 text-sm border rounded-lg bg-gray-50 dark:bg-slate-800 dark:border-slate-700 dark:text-white outline-none">
            <option value="">Все аккаунты</option>
            <option value="Действующий">Действующий</option>
            <option value="Новый">Новый</option>
          </select>

          <select value={filterTier} onChange={e => setFilterTier(e.target.value)} className="p-2 text-sm border rounded-lg bg-gray-50 dark:bg-slate-800 dark:border-slate-700 dark:text-white outline-none">
            <option value="">Все тарифы</option>
            {availableTiers.map(t => <option key={t} value={t}>{t}</option>)}
          </select>

          <select value={filterDuration} onChange={e => setFilterDuration(e.target.value)} className="p-2 text-sm border rounded-lg bg-gray-50 dark:bg-slate-800 dark:border-slate-700 dark:text-white outline-none">
            <option value="">Все сроки</option>
            {availableDurations.map(d => <option key={d} value={d}>{d}</option>)}
          </select>

          {(filterPlatform || filterRegion || filterTier || filterDuration || filterAccountType || searchQuery) && (
            <button onClick={resetFilters} className="text-sm text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 ml-auto font-medium">Сбросить фильтры</button>
          )}
        </div>
      </div>

      {isAdding && (
        <form onSubmit={handleAdd} className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-gray-200 dark:border-slate-800 flex flex-wrap gap-4 items-end">
          <div>
            <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">Платформа</label>
            <select value={newPlatform} onChange={e => handlePlatformChange(e.target.value)} className="p-2 border rounded-lg dark:bg-slate-800 dark:border-slate-700 dark:text-white">
              <option value="PlayStation">PlayStation</option>
              <option value="Xbox">Xbox</option>
            </select>
          </div>

          {newPlatform === "PlayStation" && (
            <>
              <div>
                <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">Регион</label>
                <select value={newRegion} onChange={e => setNewRegion(e.target.value)} className="p-2 border rounded-lg dark:bg-slate-800 dark:border-slate-700 dark:text-white">
                  <option value="Турция">Турция</option>
                  <option value="Украина">Украина</option>
                </select>
              </div>
              <div>
                <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">Название</label>
                <select value={newTier} onChange={e => setNewTier(e.target.value)} className="p-2 border rounded-lg dark:bg-slate-800 dark:border-slate-700 dark:text-white">
                  <option value="Essential">Essential</option>
                  <option value="Extra">Extra</option>
                  <option value="Delux">Delux</option>
                  <option value="EA Play">EA Play</option>
                </select>
              </div>
              <div>
                <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">Срок</label>
                <select required value={newDuration} onChange={e => setNewDuration(e.target.value)} className="p-2 border rounded-lg dark:bg-slate-800 dark:border-slate-700 dark:text-white">
                  <option value="1 месяц">1 месяц</option>
                  <option value="3 месяца">3 месяца</option>
                  <option value="12 месяцев">12 месяцев</option>
                </select>
              </div>
            </>
          )}

          {newPlatform === "Xbox" && (
            <>
              <div>
                <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">Тип аккаунта</label>
                <select value={newAccountType} onChange={e => setNewAccountType(e.target.value)} className="p-2 border rounded-lg dark:bg-slate-800 dark:border-slate-700 dark:text-white">
                  <option value="Действующий">Действующий</option>
                  <option value="Новый">Новый</option>
                </select>
              </div>
              <div>
                <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">Срок</label>
                <select required value={newDuration} onChange={e => setNewDuration(e.target.value)} className="p-2 border rounded-lg dark:bg-slate-800 dark:border-slate-700 dark:text-white">
                  {xboxMonths.map(m => <option key={m} value={m}>{m}</option>)}
                </select>
              </div>
            </>
          )}

          <div>
            <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">Цена (₽)</label>
            <input required type="number" value={newPrice} onChange={e => setNewPrice(e.target.value)} className="p-2 border rounded-lg dark:bg-slate-800 dark:border-slate-700 dark:text-white w-24" />
          </div>

          <button type="submit" className="px-4 py-2 bg-green-500 text-white rounded-lg font-bold hover:bg-green-600 h-10">Сохранить</button>
        </form>
      )}

      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-gray-200 dark:border-slate-800 overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-gray-50 dark:bg-slate-800/50 border-b border-gray-200 dark:border-slate-800 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">
              <th className="p-4">Платформа</th>
              <th className="p-4">Регион</th>
              <th className="p-4">Тариф</th>
              <th className="p-4">Тип</th>
              <th className="p-4">Срок</th>
              <th className="p-4">Цена (₽)</th>
              <th className="p-4 text-right">Действия</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 dark:divide-slate-800">
            {filteredPlans.length === 0 ? (
              <tr><td colSpan={7} className="p-8 text-center text-gray-500 dark:text-gray-400">Ничего не найдено по вашему запросу</td></tr>
            ) : (
              filteredPlans.map(plan => (
                <tr key={plan.id} className="hover:bg-gray-50 dark:hover:bg-slate-800/30">
                  <td className="p-4 font-bold dark:text-white">{plan.platform}</td>
                  <td className="p-4 text-gray-600 dark:text-gray-400">{plan.region || "—"}</td>
                  <td className="p-4 text-gray-600 dark:text-gray-400">{plan.tier}</td>
                  <td className="p-4 text-gray-600 dark:text-gray-400">{plan.accountType || "—"}</td>
                  <td className="p-4 text-gray-600 dark:text-gray-400">{plan.duration || "1 месяц"}</td>
                  <td className="p-4 font-bold text-blue-500">{plan.price}</td>
                  <td className="p-4 text-right flex justify-end gap-2">
                    <button onClick={() => openEditModal(plan)} className="text-gray-500 hover:text-blue-500 dark:text-gray-400 dark:hover:text-blue-400 p-2 transition-colors" title="Редактировать"><Pencil size={18} /></button>
                    <button onClick={() => handleDelete(plan.id)} className="text-red-500 hover:text-red-700 p-2 transition-colors" title="Удалить"><Trash2 size={18} /></button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {isEditModalOpen && editingPlan && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white dark:bg-slate-900 w-full max-w-lg rounded-3xl shadow-2xl overflow-hidden relative">
            <button onClick={() => setIsEditModalOpen(false)} className="absolute top-4 right-4 p-2 text-gray-400 hover:text-red-500 transition-colors"><X size={20} /></button>
            
            <div className="p-8">
              <h2 className="text-2xl font-bold dark:text-white mb-6">Редактировать тариф</h2>
              
              <form onSubmit={handleEditSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1 dark:text-gray-300">Платформа</label>
                  <select value={editForm.platform} onChange={e => handlePlatformChange(e.target.value, true)} className="w-full p-3 border rounded-xl dark:bg-slate-800 dark:border-slate-700 dark:text-white">
                    <option value="PlayStation">PlayStation</option>
                    <option value="Xbox">Xbox</option>
                  </select>
                </div>

                {editForm.platform === "PlayStation" && (
                  <>
                    <div>
                      <label className="block text-sm font-medium mb-1 dark:text-gray-300">Регион</label>
                      <select value={editForm.region} onChange={e => setEditForm({...editForm, region: e.target.value})} className="w-full p-3 border rounded-xl dark:bg-slate-800 dark:border-slate-700 dark:text-white">
                        <option value="Турция">Турция</option>
                        <option value="Украина">Украина</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1 dark:text-gray-300">Название подписки</label>
                      <select value={editForm.tier} onChange={e => setEditForm({...editForm, tier: e.target.value})} className="w-full p-3 border rounded-xl dark:bg-slate-800 dark:border-slate-700 dark:text-white">
                        <option value="Essential">Essential</option>
                        <option value="Extra">Extra</option>
                        <option value="Delux">Delux</option>
                        <option value="EA Play">EA Play</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1 dark:text-gray-300">Срок</label>
                      <select value={editForm.duration} onChange={e => setEditForm({...editForm, duration: e.target.value})} className="w-full p-3 border rounded-xl dark:bg-slate-800 dark:border-slate-700 dark:text-white">
                        <option value="1 месяц">1 месяц</option>
                        <option value="3 месяца">3 месяца</option>
                        <option value="12 месяцев">12 месяцев</option>
                      </select>
                    </div>
                  </>
                )}

                {editForm.platform === "Xbox" && (
                  <>
                    <div>
                      <label className="block text-sm font-medium mb-1 dark:text-gray-300">Тип аккаунта</label>
                      <select value={editForm.accountType} onChange={e => setEditForm({...editForm, accountType: e.target.value})} className="w-full p-3 border rounded-xl dark:bg-slate-800 dark:border-slate-700 dark:text-white">
                        <option value="Действующий">Действующий</option>
                        <option value="Новый">Новый</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1 dark:text-gray-300">Срок</label>
                      <select value={editForm.duration} onChange={e => setEditForm({...editForm, duration: e.target.value})} className="w-full p-3 border rounded-xl dark:bg-slate-800 dark:border-slate-700 dark:text-white">
                        {xboxMonths.map(m => <option key={m} value={m}>{m}</option>)}
                      </select>
                    </div>
                  </>
                )}

                <div>
                  <label className="block text-sm font-medium mb-1 dark:text-gray-300">Цена (₽)</label>
                  <input required type="number" value={editForm.price} onChange={e => setEditForm({...editForm, price: e.target.value})} className="w-full p-3 border rounded-xl dark:bg-slate-800 dark:border-slate-700 dark:text-white" />
                </div>

                <div className="pt-4 border-t border-gray-200 dark:border-slate-700 flex justify-end gap-3 mt-6">
                  <button type="button" onClick={() => setIsEditModalOpen(false)} className="px-6 py-2 rounded-xl text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-slate-800 transition-colors">Отмена</button>
                  <button type="submit" className="px-6 py-2 bg-blue-500 text-white rounded-xl font-bold hover:bg-blue-600 transition-colors">Сохранить</button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}