"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { Save, ImagePlus, ArrowLeft, ChevronDown, ChevronRight, Folder, Check, UploadCloud, Loader2, X } from "lucide-react";
import Link from "next/link";

interface ProductFormProps {
  categories: any[];
  initialData?: any;
  initialCategoryId?: string;
}

// --- Компонент выбора категории (Оставляем без изменений) ---
function CategorySelector({ categories, value, onChange }: { categories: any[], value: string, onChange: (id: string) => void }) {
  const [isOpen, setIsOpen] = useState(false);
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) setIsOpen(false);
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const getCategoryPath = (id: string): string => {
    if (!id) return "Выберите категорию";
    const cat = categories.find(c => c.id === id);
    if (!cat) return "Выберите категорию";
    let path = cat.name;
    let parentId = cat.parentId;
    while (parentId) {
      const parent = categories.find(c => c.id === parentId);
      if (parent) { path = `${parent.name} / ${path}`; parentId = parent.parentId; } else break;
    }
    return path;
  };

  const toggleExpand = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setExpanded(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const renderTree = (parentId: string | null = null, depth = 0) => {
    const levelItems = categories.filter(c => c.parentId === parentId);
    if (levelItems.length === 0) return null;

    return (
      <ul className="space-y-0.5">
        {levelItems.map(cat => {
          const hasChildren = categories.some(c => c.parentId === cat.id);
          const isExpanded = expanded[cat.id];
          const isSelected = value === cat.id;

          return (
            <li key={cat.id}>
              <div 
                className={`flex items-center justify-between px-3 py-2 text-sm cursor-pointer transition-colors rounded-lg hover:bg-blue-50 dark:hover:bg-slate-800 ${isSelected ? "bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 font-medium" : "text-gray-700 dark:text-gray-300"}`}
                style={{ paddingLeft: `${depth * 16 + 12}px` }}
                onClick={() => { onChange(cat.id); setIsOpen(false); }}
              >
                <div className="flex items-center gap-2">
                  {hasChildren ? (
                    <button onClick={(e) => toggleExpand(cat.id, e)} className="p-1 -ml-1 text-gray-400 hover:text-blue-500">
                      {isExpanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                    </button>
                  ) : <div className="w-5" />}
                  <Folder size={16} className={isSelected ? "text-blue-500" : "text-gray-400"} />
                  <span>{cat.name}</span>
                </div>
                {isSelected && <Check size={16} className="text-blue-500" />}
              </div>
              {isExpanded && renderTree(cat.id, depth + 1)}
            </li>
          );
        })}
      </ul>
    );
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button type="button" onClick={() => setIsOpen(!isOpen)} className="w-full p-3 rounded-xl border border-gray-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-left text-sm text-gray-900 dark:text-white flex items-center justify-between focus:ring-2 focus:ring-blue-500 outline-none transition-all">
        <span className="truncate">{getCategoryPath(value)}</span>
        <ChevronDown size={18} className={`text-gray-400 transition-transform ${isOpen ? "rotate-180" : ""}`} />
      </button>
      {isOpen && (
        <div className="absolute z-50 w-full mt-1 bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-700 rounded-xl shadow-xl max-h-64 overflow-y-auto p-2">
          {renderTree(null)}
        </div>
      )}
    </div>
  );
}
// --------------------------------------------------------

export default function ProductForm({ categories, initialData, initialCategoryId }: ProductFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [isUploading, setIsUploading] = useState(false); // Состояние загрузки фото
  
  const [name, setName] = useState(initialData?.name || "");
  const [sku, setSku] = useState(initialData?.sku || "");
  const [description, setDescription] = useState(initialData?.description || "");
  const [priceCash, setPriceCash] = useState(initialData ? (initialData.priceCash / 100).toString() : "");
  const [priceCard, setPriceCard] = useState(initialData ? (initialData.priceCard / 100).toString() : "");
  const [condition, setCondition] = useState(initialData?.condition || "Новый");
  const [availability, setAvailability] = useState(initialData?.availability || "BOTH");
  const [categoryId, setCategoryId] = useState(initialData?.categoryId || initialCategoryId || categories[0]?.id || "");
  const [maxBookingHours, setMaxBookingHours] = useState(initialData?.maxBookingHours?.toString() || "24");
  
  // Стейт для картинки (ссылка или загруженный файл)
  const [imageUrl, setImageUrl] = useState(initialData?.images?.[0] || "");

  // Функция загрузки файла в Cloud.ru
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      if (res.ok) {
        const data = await res.json();
        setImageUrl(data.url); // Сохраняем полученную ссылку в стейт
      } else {
        alert("Ошибка при загрузке изображения");
      }
    } catch (error) {
      console.error(error);
      alert("Ошибка сети при загрузке фото");
    } finally {
      setIsUploading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const url = initialData ? `/api/admin/products/${initialData.id}` : "/api/admin/products";
      const method = initialData ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name, sku, description,
          priceCash: Number(priceCash) * 100,
          priceCard: Number(priceCard) * 100,
          condition, availability, categoryId,
          maxBookingHours: Number(maxBookingHours),
          images: imageUrl ? [imageUrl] : [], // Отправляем массив с одной ссылкой
        }),
      });

      if (res.ok) {
        if (initialCategoryId && !initialData) {
          router.push(`/admin/categories/${initialCategoryId}`);
        } else {
          router.push("/admin/products");
        }
        router.refresh();
      } else {
        alert("Ошибка при сохранении товара");
      }
    } catch (error) {
      alert("Ошибка сети");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white dark:bg-slate-900 p-8 rounded-2xl shadow-sm border border-gray-200 dark:border-slate-800 space-y-6">
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium mb-2 dark:text-gray-300">Название товара</label>
          <input required type="text" value={name} onChange={e => setName(e.target.value)} className="w-full p-3 rounded-xl border dark:border-slate-700 bg-transparent dark:text-white focus:ring-2 focus:ring-blue-500 outline-none" placeholder="PlayStation 5 Slim" />
        </div>
        <div>
          <label className="block text-sm font-medium mb-2 dark:text-gray-300">Артикул (SKU)</label>
          <input required type="text" value={sku} onChange={e => setSku(e.target.value)} className="w-full p-3 rounded-xl border dark:border-slate-700 bg-transparent dark:text-white focus:ring-2 focus:ring-blue-500 outline-none" placeholder="PS5-001" />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium mb-2 dark:text-gray-300">Описание</label>
        <textarea rows={3} value={description} onChange={e => setDescription(e.target.value)} className="w-full p-3 rounded-xl border dark:border-slate-700 bg-transparent dark:text-white focus:ring-2 focus:ring-blue-500 outline-none" placeholder="Описание товара..." />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium mb-2 dark:text-gray-300">Цена за наличные (₽)</label>
          <input required type="number" value={priceCash} onChange={e => setPriceCash(e.target.value)} className="w-full p-3 rounded-xl border dark:border-slate-700 bg-transparent dark:text-white focus:ring-2 focus:ring-blue-500 outline-none" placeholder="65000" />
        </div>
        <div>
          <label className="block text-sm font-medium mb-2 dark:text-gray-300">Цена по терминалу (₽)</label>
          <input required type="number" value={priceCard} onChange={e => setPriceCard(e.target.value)} className="w-full p-3 rounded-xl border dark:border-slate-700 bg-transparent dark:text-white focus:ring-2 focus:ring-blue-500 outline-none" placeholder="68000" />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div>
          <label className="block text-sm font-medium mb-2 dark:text-gray-300">Категория</label>
          <CategorySelector categories={categories} value={categoryId} onChange={setCategoryId} />
        </div>
        <div>
          <label className="block text-sm font-medium mb-2 dark:text-gray-300">Состояние</label>
          <select value={condition} onChange={e => setCondition(e.target.value)} className="w-full p-3 rounded-xl border dark:border-slate-700 bg-transparent dark:text-white focus:ring-2 focus:ring-blue-500 outline-none">
            <option value="Новый" className="dark:bg-slate-800">Новый</option>
            <option value="Б/У отличное" className="dark:bg-slate-800">Б/У отличное</option>
            <option value="Б/У хорошее" className="dark:bg-slate-800">Б/У хорошее</option>
            <option value="С царапинами" className="dark:bg-slate-800">С царапинами</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium mb-2 dark:text-gray-300">Наличие</label>
          <select value={availability} onChange={e => setAvailability(e.target.value)} className="w-full p-3 rounded-xl border dark:border-slate-700 bg-transparent dark:text-white focus:ring-2 focus:ring-blue-500 outline-none">
            <option value="BOTH" className="dark:bg-slate-800">В обоих филиалах</option>
            <option value="ANGARSK" className="dark:bg-slate-800">Только в Ангарске</option>
            <option value="IRKUTSK" className="dark:bg-slate-800">Только в Иркутске</option>
            <option value="ON_ORDER" className="dark:bg-slate-800">Под заказ</option>
            <option value="OUT_OF_STOCK" className="dark:bg-slate-800">Нет в наличии</option>
          </select>
        </div>
      </div>

      {/* БЛОК ЗАГРУЗКИ ФОТО */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium mb-2 dark:text-gray-300">Фотография товара</label>
          
          {imageUrl ? (
            // Если фото есть, показываем превью и кнопку удаления
            <div className="relative w-full h-40 rounded-xl border border-gray-200 dark:border-slate-700 overflow-hidden group">
              <img src={imageUrl} alt="Превью" className="w-full h-full object-cover" />
              <button 
                type="button" 
                onClick={() => setImageUrl("")} 
                className="absolute top-2 right-2 bg-red-500 text-white p-1.5 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                title="Удалить фото"
              >
                <X size={16} />
              </button>
            </div>
          ) : (
            // Если фото нет, показываем кнопку загрузки
            <div className="relative w-full h-40 rounded-xl border-2 border-dashed border-gray-300 dark:border-slate-700 flex flex-col items-center justify-center bg-gray-50 dark:bg-slate-800/50 hover:bg-gray-100 dark:hover:bg-slate-800 transition-colors">
              {isUploading ? (
                <>
                  <Loader2 className="animate-spin text-blue-500 mb-2" size={24} />
                  <span className="text-sm text-gray-500">Загрузка в Cloud.ru...</span>
                </>
              ) : (
                <>
                  <UploadCloud className="text-gray-400 mb-2" size={24} />
                  <span className="text-sm text-gray-500 font-medium">Нажмите, чтобы загрузить</span>
                  <input 
                    type="file" 
                    accept="image/*" 
                    onChange={handleFileUpload} 
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" 
                  />
                </>
              )}
            </div>
          )}
        </div>
        
        <div>
          <label className="block text-sm font-medium mb-2 dark:text-gray-300">Макс. срок брони (часов)</label>
          <input type="number" value={maxBookingHours} onChange={e => setMaxBookingHours(e.target.value)} className="w-full p-3 rounded-xl border dark:border-slate-700 bg-transparent dark:text-white focus:ring-2 focus:ring-blue-500 outline-none" />
        </div>
      </div>

      <div className="pt-4 border-t border-gray-200 dark:border-slate-800 flex justify-between items-center">
        <Link href={initialCategoryId ? `/admin/categories/${initialCategoryId}` : "/admin/products"} className="text-gray-500 hover:text-gray-900 dark:hover:text-white flex items-center gap-1 text-sm font-medium">
          <ArrowLeft size={16} /> Отмена
        </Link>
        <button disabled={loading || isUploading} type="submit" className="flex items-center gap-2 px-8 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-medium transition-colors disabled:opacity-50">
          <Save size={20} />
          {loading ? "Сохранение..." : (initialData ? "Обновить товар" : "Сохранить товар")}
        </button>
      </div>
    </form>
  );
}