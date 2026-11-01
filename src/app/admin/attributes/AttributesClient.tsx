"use client";

import { useState, useEffect, useRef } from "react";
import { Plus, Trash2, Loader2, FolderTree, ListPlus, ChevronDown, ChevronRight, Pencil, X, DownloadCloud, Check } from "lucide-react";

export default function AttributesClient() {
  const [types, setTypes] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [seeding, setSeeding] = useState(false);

  const [selectedType, setSelectedType] = useState<any>(null);
  
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingTypeId, setEditingTypeId] = useState<string | null>(null);
  const [newTypeName, setNewTypeName] = useState("");
  const [newCategoryIds, setNewCategoryIds] = useState<string[]>([]);
  
  const [isCatDropdownOpen, setIsCatDropdownOpen] = useState(false);
  const [expandedCategories, setExpandedCategories] = useState<string[]>([]);
  const catDropdownRef = useRef<HTMLDivElement>(null);

  const [isAddingValue, setIsAddingValue] = useState(false);
  const [newValue, setNewValue] = useState("");
  
  // Стейты для редактирования значения
  const [editingValueId, setEditingValueId] = useState<string | null>(null);
  const [editValueText, setEditValueText] = useState("");
  
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = () => {
    setLoading(true);
    Promise.all([
      fetch("/api/admin/attributes").then(res => res.json()),
      fetch("/api/admin/categories/list").then(res => res.json())
    ]).then(([typesData, catsData]) => {
      if (Array.isArray(typesData)) setTypes(typesData);
      if (Array.isArray(catsData)) setCategories(catsData);
    }).finally(() => setLoading(false));
  };

  const handleSeed = async () => {
    if (!confirm("Загрузить базовый справочник? Существующие значения не удалятся, добавятся только новые.")) return;
    setSeeding(true);
    try {
      const res = await fetch("/api/admin/attributes/seed", { method: "POST" });
      if (res.ok) {
        alert("Базовый справочник успешно загружен!");
        fetchData();
      } else {
        alert("Ошибка при загрузке");
      }
    } finally {
      setSeeding(false);
    }
  };

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (catDropdownRef.current && !catDropdownRef.current.contains(e.target as Node)) {
        setIsCatDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const openAddForm = () => {
    setEditingTypeId(null);
    setNewTypeName("");
    setNewCategoryIds([]);
    setIsFormOpen(true);
  };

  const openEditForm = (type: any, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingTypeId(type.id);
    setNewTypeName(type.name);
    setNewCategoryIds(type.categories?.map((c: any) => c.id) || []);
    setIsFormOpen(true);
  };

  const handleSaveType = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const url = editingTypeId 
        ? `/api/admin/attributes/${editingTypeId}` 
        : "/api/admin/attributes";
      
      const method = editingTypeId ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: newTypeName, categoryIds: newCategoryIds }),
      });
      
      if (res.ok) {
        const saved = await res.json();
        if (editingTypeId) {
          setTypes(types.map(t => t.id === editingTypeId ? { ...t, ...saved, values: t.values } : t));
          if (selectedType?.id === editingTypeId) {
            setSelectedType({ ...selectedType, ...saved });
          }
        } else {
          setTypes([...types, { ...saved, values: [] }]);
        }
        setIsFormOpen(false);
      } else {
        const data = await res.json();
        alert(data.error);
      }
    } finally { setSaving(false); }
  };

  const handleDeleteType = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!confirm("Удалить этот тип характеристики? Все его значения тоже удалятся.")) return;
    const res = await fetch(`/api/admin/attributes/${id}`, { method: "DELETE" });
    if (res.ok) {
      setTypes(types.filter(t => t.id !== id));
      if (selectedType?.id === id) setSelectedType(null);
    }
  };

  const handleAddValue = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedType) return;
    setSaving(true);
    try {
      const res = await fetch("/api/admin/attributes/values", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ value: newValue, attributeTypeId: selectedType.id }),
      });
      if (res.ok) {
        const added = await res.json();
        const updatedTypes = types.map(t =>
          t.id === selectedType.id ? { ...t, values: [...t.values, added] } : t
        );
        setTypes(updatedTypes);
        setSelectedType({ ...selectedType, values: [...selectedType.values, added] });
        setNewValue("");
        setIsAddingValue(false);
      }
    } finally { setSaving(false); }
  };

  // НОВАЯ ФУНКЦИЯ: Сохранение отредактированного значения
  const handleSaveEditValue = async (id: string) => {
    if (!editValueText.trim()) return;
    setSaving(true);
    try {
      const res = await fetch("/api/admin/attributes/values", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, value: editValueText }),
      });
      
      if (res.ok) {
        const updated = await res.json();
        
        // Обновляем состояние
        const updatedValues = selectedType.values.map((v: any) => 
          v.id === id ? { ...v, value: updated.value } : v
        );
        const updatedTypes = types.map(t =>
          t.id === selectedType.id ? { ...t, values: updatedValues } : t
        );
        
        setTypes(updatedTypes);
        setSelectedType({ ...selectedType, values: updatedValues });
        setEditingValueId(null);
      }
    } finally { setSaving(false); }
  };

  const handleDeleteValue = async (id: string) => {
    const res = await fetch(`/api/admin/attributes/values?id=${id}`, { method: "DELETE" });
    if (res.ok) {
      const updatedValues = selectedType.values.filter((v: any) => v.id !== id);
      const updatedTypes = types.map(t =>
        t.id === selectedType.id ? { ...t, values: updatedValues } : t
      );
      setTypes(updatedTypes);
      setSelectedType({ ...selectedType, values: updatedValues });
    }
  };

  const toggleExpand = (id: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setExpandedCategories(prev => 
      prev.includes(id) ? prev.filter(c => c !== id) : [...prev, id]
    );
  };

  const getSelectedChildrenCount = (categoryId: string): number => {
    let count = 0;
    const children = categories.filter(c => c.parentId === categoryId);
    
    for (const child of children) {
      if (newCategoryIds.includes(child.id)) {
        count++;
      }
      count += getSelectedChildrenCount(child.id);
    }
    
    return count;
  };

  const renderCategoryTree = (parentId: string | null = null, level = 0): React.ReactNode => {
    const items = categories.filter(c => c.parentId === parentId);

    return items.map(cat => {
      const hasChildren = categories.some(c => c.parentId === cat.id);
      const isExpanded = expandedCategories.includes(cat.id);
      const selectedChildrenCount = getSelectedChildrenCount(cat.id);

      return (
        <div key={cat.id} className="select-none">
          <div 
            className="flex items-center gap-1 py-1 hover:bg-gray-50 dark:hover:bg-slate-800 rounded px-2 transition-colors"
            style={{ paddingLeft: `${level * 16 + 8}px` }}
          >
            {hasChildren ? (
              <button
                type="button"
                onClick={(e) => toggleExpand(cat.id, e)}
                className="p-0.5 text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 transition-colors shrink-0"
              >
                {isExpanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
              </button>
            ) : (
              <div className="w-[18px] shrink-0" />
            )}

            <label className="flex items-center gap-2 cursor-pointer flex-1 min-w-0">
              <input
                type="checkbox"
                checked={newCategoryIds.includes(cat.id)}
                onChange={(e) => {
                  if (e.target.checked) {
                    setNewCategoryIds([...newCategoryIds, cat.id]);
                  } else {
                    setNewCategoryIds(newCategoryIds.filter(id => id !== cat.id));
                  }
                }}
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 shrink-0"
              />
              <span className="text-sm dark:text-gray-300 truncate">{cat.name}</span>
              
              {selectedChildrenCount > 0 && (
                <span className="ml-1 shrink-0 bg-blue-100 text-blue-600 dark:bg-blue-900/50 dark:text-blue-300 text-[10px] font-bold px-1.5 py-0.5 rounded-full">
                  +{selectedChildrenCount}
                </span>
              )}
            </label>
          </div>

          {hasChildren && isExpanded && (
            <div>{renderCategoryTree(cat.id, level + 1)}</div>
          )}
        </div>
      );
    });
  };

  if (loading) return <div className="p-8 text-center text-gray-500">Загрузка...</div>;

  return (
    <div className="flex flex-col lg:flex-row gap-6 h-[calc(100vh-200px)]">
      {/* ЛЕВАЯ КОЛОНКА: СПИСОК ТИПОВ */}
      <div className="w-full lg:w-1/3 bg-white dark:bg-slate-900 rounded-2xl border border-gray-200 dark:border-slate-800 flex flex-col overflow-hidden">
        <div className="p-4 border-b border-gray-200 dark:border-slate-800 flex justify-between items-center bg-gray-50 dark:bg-slate-800/50">
          <h2 className="font-bold dark:text-white">Типы характеристик</h2>
          <div className="flex gap-2">
            <button 
              onClick={handleSeed} 
              disabled={seeding}
              className="px-3 py-1.5 bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-bold rounded-lg hover:bg-slate-300 dark:hover:bg-slate-600 transition-colors flex items-center gap-1"
              title="Загрузить базовые характеристики"
            >
              {seeding ? <Loader2 size={14} className="animate-spin" /> : <DownloadCloud size={14} />} База
            </button>
            <button onClick={openAddForm} className="p-1.5 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors">
              <Plus size={18} />
            </button>
          </div>
        </div>

        {isFormOpen && (
          <form onSubmit={handleSaveType} className="p-4 border-b border-gray-200 dark:border-slate-800 bg-blue-50 dark:bg-slate-800/20 space-y-3 relative">
            <button type="button" onClick={() => setIsFormOpen(false)} className="absolute top-2 right-2 text-gray-400 hover:text-red-500">
               <X size={16} />
            </button>
            <p className="text-xs font-bold text-blue-600 dark:text-blue-400 mb-1">
              {editingTypeId ? "Редактирование" : "Новый тип"}
            </p>
            <input
              required
              placeholder="Название (Жанр, Модель...)"
              value={newTypeName}
              onChange={e => setNewTypeName(e.target.value)}
              className="w-full p-2 text-sm border rounded-lg dark:bg-slate-800 dark:border-slate-700 dark:text-white"
            />

            <div className="relative" ref={catDropdownRef}>
              <button
                type="button"
                onClick={() => setIsCatDropdownOpen(!isCatDropdownOpen)}
                className="w-full p-2 text-sm border rounded-lg dark:bg-slate-800 dark:border-slate-700 dark:text-white flex justify-between items-center"
              >
                <span className="truncate">
                  {newCategoryIds.length === 0 ? "Для всех категорий" : `Выбрано: ${newCategoryIds.length}`}
                </span>
                <ChevronDown size={16} />
              </button>

              {isCatDropdownOpen && (
                <div className="absolute z-20 top-full left-0 right-0 mt-1 bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-lg shadow-xl max-h-60 overflow-y-auto p-2 custom-scrollbar">
                  <label className="flex items-center gap-2 py-1 cursor-pointer hover:bg-gray-50 dark:hover:bg-slate-700 rounded px-2 font-semibold text-sm">
                    <input
                      type="checkbox"
                      checked={newCategoryIds.length === 0}
                      onChange={() => setNewCategoryIds([])}
                      className="rounded border-gray-300 text-blue-600"
                    />
                    <span className="dark:text-gray-200">Для всех категорий</span>
                  </label>
                  <div className="my-1 border-t border-gray-100 dark:border-slate-700"></div>
                  {renderCategoryTree()}
                </div>
              )}
            </div>

            <button type="submit" disabled={saving} className="w-full py-2 bg-green-500 text-white text-sm rounded-lg font-bold">
              {saving ? "Сохранение..." : "Сохранить"}
            </button>
          </form>
        )}

        <div className="flex-1 overflow-y-auto p-2 space-y-1 custom-scrollbar">
          {types.length === 0 ? (
            <p className="text-center text-sm text-gray-500 mt-4">Нет созданных характеристик. Нажмите «База» для быстрого старта.</p>
          ) : (
            types.map(type => (
              <div
                key={type.id}
                onClick={() => setSelectedType(type)}
                className={`p-3 rounded-xl cursor-pointer flex justify-between items-center group transition-colors ${selectedType?.id === type.id ? "bg-blue-50 dark:bg-slate-800 border border-blue-200 dark:border-slate-700" : "hover:bg-gray-50 dark:hover:bg-slate-800/50"}`}
              >
                <div className="min-w-0 pr-2">
                  <p className="font-bold text-sm dark:text-white truncate">{type.name}</p>
                  <p className="text-[10px] text-gray-500 truncate">
                    {type.categories?.length ? `Категорий: ${type.categories.length}` : "Все категории"}
                  </p>
                </div>
                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-all shrink-0">
                  <button onClick={(e) => openEditForm(type, e)} className="text-blue-500 p-1 hover:bg-blue-100 dark:hover:bg-blue-900/30 rounded">
                    <Pencil size={14} />
                  </button>
                  <button onClick={(e) => handleDeleteType(type.id, e)} className="text-red-500 p-1 hover:bg-red-50 dark:hover:bg-red-900/30 rounded">
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* ПРАВАЯ КОЛОНКА: ЗНАЧЕНИЯ ВЫБРАННОГО ТИПА */}
      <div className="w-full lg:w-2/3 bg-white dark:bg-slate-900 rounded-2xl border border-gray-200 dark:border-slate-800 flex flex-col overflow-hidden">
        {selectedType ? (
          <>
            <div className="p-4 border-b border-gray-200 dark:border-slate-800 flex justify-between items-center bg-gray-50 dark:bg-slate-800/50">
              <div>
                <h2 className="font-bold dark:text-white">{selectedType.name}</h2>
                <p className="text-xs text-gray-500">
                  {selectedType.categories?.length
                    ? `Категории: ${selectedType.categories.map((c: any) => c.name).join(", ")}`
                    : "Доступен для всех категорий"}
                </p>
              </div>
              <button onClick={() => setIsAddingValue(!isAddingValue)} className="px-3 py-1.5 bg-blue-500 text-white text-sm rounded-lg hover:bg-blue-600 transition-colors flex items-center gap-1">
                <ListPlus size={16} /> Добавить
              </button>
            </div>

            {isAddingValue && (
              <form onSubmit={handleAddValue} className="p-4 border-b border-gray-200 dark:border-slate-800 bg-blue-50 dark:bg-slate-800/20 flex gap-2">
                <input
                  required
                  placeholder="Новое значение..."
                  value={newValue}
                  onChange={e => setNewValue(e.target.value)}
                  className="flex-1 p-2 text-sm border rounded-lg dark:bg-slate-800 dark:border-slate-700 dark:text-white"
                  autoFocus
                />
                <button type="submit" disabled={saving} className="px-4 py-2 bg-green-500 text-white text-sm rounded-lg font-bold">
                  Сохранить
                </button>
              </form>
            )}

            <div className="flex-1 overflow-y-auto p-4 custom-scrollbar">
              {selectedType.values.length === 0 ? (
                <div className="text-center text-sm text-gray-500 mt-8">Значений пока нет. Нажмите «Добавить».</div>
              ) : (
                <div className="flex flex-wrap gap-2">
                  {selectedType.values.map((val: any) => (
                    <div key={val.id} className="flex items-center gap-2 px-3 py-1.5 bg-gray-100 dark:bg-slate-800 rounded-lg border border-gray-200 dark:border-slate-700 group">
                      {editingValueId === val.id ? (
                        // РЕЖИМ РЕДАКТИРОВАНИЯ
                        <>
                          <input
                            type="text"
                            value={editValueText}
                            onChange={(e) => setEditValueText(e.target.value)}
                            className="w-24 sm:w-32 p-1 text-sm border rounded bg-white dark:bg-slate-900 dark:border-slate-600 dark:text-white outline-none"
                            autoFocus
                          />
                          <button onClick={() => handleSaveEditValue(val.id)} disabled={saving} className="text-green-500 hover:text-green-600">
                            <Check size={16} />
                          </button>
                          <button onClick={() => setEditingValueId(null)} className="text-gray-400 hover:text-red-500">
                            <X size={16} />
                          </button>
                        </>
                      ) : (
                        // ОБЫЧНЫЙ РЕЖИМ
                        <>
                          <span className="text-sm font-medium dark:text-white">{val.value}</span>
                          <button 
                            onClick={() => { setEditingValueId(val.id); setEditValueText(val.value); }} 
                            className="text-gray-400 hover:text-blue-500 transition-colors opacity-0 group-hover:opacity-100"
                          >
                            <Pencil size={14} />
                          </button>
                          <button onClick={() => handleDeleteValue(val.id)} className="text-gray-400 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100">
                            <Trash2 size={14} />
                          </button>
                        </>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </>
        ) : (
          <div className="flex flex-col items-center justify-center h-full text-gray-400">
            <FolderTree size={48} className="mb-4 opacity-50" />
            <p>Выберите характеристику слева, чтобы управлять её значениями</p>
          </div>
        )}
      </div>
    </div>
  );
}