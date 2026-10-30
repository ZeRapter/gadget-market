"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, Trash2, Save, X, Loader2, Wrench, GripVertical } from "lucide-react";

export default function RepairAdminClient({ initialServices }: { initialServices: any[] }) {
  const router = useRouter();
  
  // Сортируем по sortOrder при загрузке
  const [services, setServices] = useState(
    [...initialServices].sort((a, b) => (a.sortOrder || 0) - (b.sortOrder || 0))
  );
  
  const [loadingId, setLoadingId] = useState<string | null>(null);
  
  // Стейты для добавления
  const [isAdding, setIsAdding] = useState(false);
  const [newCategory, setNewCategory] = useState("Приставка");
  const [newName, setNewName] = useState("");
  const [newDeviceModel, setNewDeviceModel] = useState("");
  const [newPrice, setNewPrice] = useState("");
  const [newIsFromPrice, setNewIsFromPrice] = useState(false); 
  const [newPriceUnit, setNewPriceUnit] = useState(""); 

  // Стейты для редактирования
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState("");
  const [editDeviceModel, setEditDeviceModel] = useState("");
  const [editPrice, setEditPrice] = useState("");
  const [editCategory, setEditCategory] = useState("");
  const [editIsFromPrice, setEditIsFromPrice] = useState(false); 
  const [editPriceUnit, setEditPriceUnit] = useState(""); 

  // Стейты для Drag & Drop
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [draggedOverIndex, setDraggedOverIndex] = useState<number | null>(null);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoadingId("add");
    try {
      const maxSortOrder = services.length > 0 ? Math.max(...services.map(s => s.sortOrder || 0)) + 1 : 0;
      
      const res = await fetch("/api/admin/repair", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          category: newCategory, 
          name: newName, 
          deviceModel: newDeviceModel, 
          price: newPrice,
          isFromPrice: newIsFromPrice,
          priceUnit: newPriceUnit,
          sortOrder: maxSortOrder
        }),
      });
      
      if (res.ok) {
        const added = await res.json();
        setServices([...services, added]);
        setIsAdding(false);
        setNewName("");
        setNewDeviceModel("");
        setNewPrice("");
        setNewIsFromPrice(false);
        setNewPriceUnit("");
      }
    } catch (e) { alert("Ошибка"); } finally { setLoadingId(null); }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Удалить эту услугу?")) return;
    setLoadingId(id);
    try {
      const res = await fetch(`/api/admin/repair/${id}`, { method: "DELETE" });
      if (res.ok) setServices(services.filter(s => s.id !== id));
    } catch (e) { alert("Ошибка"); } finally { setLoadingId(null); }
  };

  const startEdit = (service: any) => {
    setEditingId(service.id);
    setEditName(service.name);
    setEditDeviceModel(service.deviceModel || "");
    setEditPrice(service.price.toString());
    setEditCategory(service.category);
    setEditIsFromPrice(service.isFromPrice);
    setEditPriceUnit(service.priceUnit || ""); 
  };

  const handleSaveEdit = async (id: string) => {
    setLoadingId(id);
    try {
      const res = await fetch(`/api/admin/repair/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          category: editCategory, 
          name: editName, 
          deviceModel: editDeviceModel, 
          price: editPrice,
          isFromPrice: editIsFromPrice,
          priceUnit: editPriceUnit
        }),
      });
      if (res.ok) {
        const updated = await res.json();
        setServices(services.map(s => s.id === id ? updated : s));
        setEditingId(null);
      }
    } catch (e) { alert("Ошибка"); } finally { setLoadingId(null); }
  };

  // ЛОГИКА DRAG & DROP
  const handleDragStart = (e: React.DragEvent, index: number) => {
    setDraggedIndex(index);
    // Устанавливаем прозрачность перетаскиваемого элемента
    e.dataTransfer.effectAllowed = "move";
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    if (draggedIndex === index) return;
    setDraggedOverIndex(index);
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    if (draggedIndex === null || draggedOverIndex === null || draggedIndex === draggedOverIndex) {
      setDraggedIndex(null);
      setDraggedOverIndex(null);
      return;
    }

    // Меняем элементы местами в локальном массиве
    const newServices = [...services];
    const [draggedItem] = newServices.splice(draggedIndex, 1);
    newServices.splice(draggedOverIndex, 0, draggedItem);

    // Пересчитываем sortOrder для всех элементов
    const updatedServices = newServices.map((service, index) => ({
      ...service,
      sortOrder: index
    }));

    setServices(updatedServices);
    setDraggedIndex(null);
    setDraggedOverIndex(null);

    // Отправляем новый порядок на сервер
    try {
      await fetch("/api/admin/repair/reorder", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ items: updatedServices.map(s => ({ id: s.id, sortOrder: s.sortOrder })) }),
      });
    } catch (e) {
      console.error("Ошибка сохранения порядка", e);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <button onClick={() => setIsAdding(!isAdding)} className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-xl font-medium hover:bg-blue-600 transition-colors">
          <Plus size={18} /> Добавить услугу
        </button>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          * Зажмите <GripVertical className="inline mx-1" size={16} /> и потяните, чтобы изменить порядок
        </p>
      </div>

      {isAdding && (
        <form onSubmit={handleAdd} className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-gray-200 dark:border-slate-800 flex flex-wrap gap-4 items-end">
          <div>
            <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">Категория</label>
            <select value={newCategory} onChange={e => setNewCategory(e.target.value)} className="p-2 border rounded-lg dark:bg-slate-800 dark:border-slate-700 dark:text-white">
              <option value="Приставка">Приставка</option>
              <option value="ПК">ПК</option>
            </select>
          </div>
          <div className="flex-1 min-w-[150px]">
            <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">Вид услуги</label>
            <input required value={newName} onChange={e => setNewName(e.target.value)} placeholder="Например: Установка игр" className="w-full p-2 border rounded-lg dark:bg-slate-800 dark:border-slate-700 dark:text-white" />
          </div>
          <div className="flex-1 min-w-[150px]">
            <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">Модель (необязательно)</label>
            <input value={newDeviceModel} onChange={e => setNewDeviceModel(e.target.value)} placeholder="PS4 / Xbox One" className="w-full p-2 border rounded-lg dark:bg-slate-800 dark:border-slate-700 dark:text-white" />
          </div>
          <div>
            <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">Цена (₽)</label>
            <input required type="number" value={newPrice} onChange={e => setNewPrice(e.target.value)} className="p-2 border rounded-lg dark:bg-slate-800 dark:border-slate-700 dark:text-white w-24" />
          </div>
          <div>
            <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">Ед. изм.</label>
            <input value={newPriceUnit} onChange={e => setNewPriceUnit(e.target.value)} placeholder="шт" className="p-2 border rounded-lg dark:bg-slate-800 dark:border-slate-700 dark:text-white w-16" />
          </div>
          <div className="flex items-center h-10 pb-1">
            <label className="flex items-center gap-2 cursor-pointer text-sm dark:text-gray-300">
              <input type="checkbox" checked={newIsFromPrice} onChange={e => setNewIsFromPrice(e.target.checked)} className="w-4 h-4 rounded text-blue-500 focus:ring-blue-500" />
              Цена "от"
            </label>
          </div>
          <button type="submit" disabled={loadingId === "add"} className="px-4 py-2 bg-green-500 text-white rounded-lg font-bold hover:bg-green-600 h-10 disabled:opacity-50">
            Сохранить
          </button>
        </form>
      )}

      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-gray-200 dark:border-slate-800 overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-gray-50 dark:bg-slate-800/50 border-b text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">
              <th className="p-4 w-10"></th>
              <th className="p-4">Вид услуги</th>
              <th className="p-4">Модель</th>
              <th className="p-4">Категория</th>
              <th className="p-4 w-40">Цена</th>
              <th className="p-4 w-24 text-right">Действия</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 dark:divide-slate-800">
            {services.map((service, index) => (
              <tr 
                key={service.id} 
                draggable={editingId !== service.id}
                onDragStart={(e) => handleDragStart(e, index)}
                onDragOver={(e) => handleDragOver(e, index)}
                onDrop={handleDrop}
                className={`hover:bg-gray-50 dark:hover:bg-slate-800/30 transition-colors ${draggedOverIndex === index ? 'border-t-2 border-blue-500' : ''} ${draggedIndex === index ? 'opacity-50' : ''}`}
              >
                <td className="p-4 cursor-grab active:cursor-grabbing text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 flex justify-center">
                  <GripVertical size={20} />
                </td>
                <td className="p-4">
                  {editingId === service.id ? (
                    <input value={editName} onChange={e => setEditName(e.target.value)} className="w-full p-1 border rounded dark:bg-slate-800 dark:border-slate-700 dark:text-white text-sm" />
                  ) : (
                    <span className="text-sm font-bold text-gray-900 dark:text-white">{service.name}</span>
                  )}
                </td>
                <td className="p-4">
                  {editingId === service.id ? (
                    <input value={editDeviceModel} onChange={e => setEditDeviceModel(e.target.value)} className="w-full p-1 border rounded dark:bg-slate-800 dark:border-slate-700 dark:text-white text-sm" />
                  ) : (
                    <span className="text-sm text-gray-600 dark:text-gray-400">{service.deviceModel || "—"}</span>
                  )}
                </td>
                <td className="p-4">
                  {editingId === service.id ? (
                    <select value={editCategory} onChange={e => setEditCategory(e.target.value)} className="p-1 border rounded dark:bg-slate-800 dark:border-slate-700 dark:text-white text-sm">
                      <option value="Приставка">Приставка</option>
                      <option value="ПК">ПК</option>
                    </select>
                  ) : (
                    <span className="text-sm font-medium text-gray-600 dark:text-gray-300">{service.category}</span>
                  )}
                </td>
                <td className="p-4">
                  {editingId === service.id ? (
                    <div className="flex flex-col gap-2">
                      <div className="flex gap-1">
                        <input type="number" value={editPrice} onChange={e => setEditPrice(e.target.value)} className="w-16 p-1 border rounded dark:bg-slate-800 dark:border-slate-700 dark:text-white text-sm" />
                        <input value={editPriceUnit} onChange={e => setEditPriceUnit(e.target.value)} placeholder="шт" className="w-12 p-1 border rounded dark:bg-slate-800 dark:border-slate-700 dark:text-white text-sm" />
                      </div>
                      <label className="flex items-center gap-1 cursor-pointer text-xs dark:text-gray-300">
                        <input type="checkbox" checked={editIsFromPrice} onChange={e => setEditIsFromPrice(e.target.checked)} className="w-3 h-3 rounded text-blue-500" />
                        Цена "от"
                      </label>
                    </div>
                  ) : (
                    <span className="text-sm font-bold text-blue-500 whitespace-nowrap">
                      {service.isFromPrice ? "от " : ""}{service.price} ₽ {service.priceUnit ? `/ ${service.priceUnit}` : ""}
                    </span>
                  )}
                </td>
                <td className="p-4 text-right">
                  <div className="flex items-center justify-end gap-2">
                    {loadingId === service.id && <Loader2 className="animate-spin text-blue-500" size={16} />}
                    {editingId === service.id ? (
                      <>
                        <button onClick={() => handleSaveEdit(service.id)} className="text-green-500 p-1 hover:bg-green-50 rounded"><Save size={18} /></button>
                        <button onClick={() => setEditingId(null)} className="text-gray-400 p-1 hover:bg-gray-100 rounded"><X size={18} /></button>
                      </>
                    ) : (
                      <>
                        <button onClick={() => startEdit(service)} className="text-blue-500 p-1 hover:bg-blue-50 rounded"><Wrench size={18} /></button>
                        <button onClick={() => handleDelete(service.id)} className="text-red-500 p-1 hover:bg-red-50 rounded"><Trash2 size={18} /></button>
                      </>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}