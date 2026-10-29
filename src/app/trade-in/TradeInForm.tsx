"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { CheckCircle2, User, Phone, Package, HelpCircle, Box } from "lucide-react";

export default function TradeInForm() {
  const { data: session } = useSession();
  
  // Достаем данные из сессии
  const userPhone = (session?.user as any)?.phone;
  const userName = session?.user?.name;

  const [deviceToTrade, setDeviceToTrade] = useState("");
  const [condition, setCondition] = useState("Идеальное");
  const [completeness, setCompleteness] = useState(""); 
  const [desiredDevice, setDesiredDevice] = useState("");
  
  const [contactMethod, setContactMethod] = useState("telegram");
  const [contactValue, setContactValue] = useState("");
  const [contactPhone, setContactPhone] = useState("");
  
  // Имя и телефон теперь всегда в стейтах
  const [guestName, setGuestName] = useState("");
  const [guestPhone, setGuestPhone] = useState("");

  // Подтягиваем данные из профиля при загрузке
  useEffect(() => {
    if (userName) setGuestName(userName);
    if (userPhone) setGuestPhone(userPhone);
  }, [userName, userPhone]);

  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (contactMethod === "vk" && !contactValue.trim()) {
      setError("Для связи во ВКонтакте обязательно укажите ссылку на профиль или ID");
      return;
    }
    if (contactMethod === "telegram" && !contactValue.trim() && !contactPhone.trim()) {
      setError("Для Telegram укажите хотя бы один способ связи (никнейм или телефон)");
      return;
    }
    if (contactMethod === "max" && !contactPhone.trim()) {
      setError("Для связи в Max обязательно укажите номер телефона");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("/api/trade-in", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          deviceToTrade,
          condition,
          completeness,
          desiredDevice,
          contactMethod,
          contactValue,
          contactPhone,
          guestName, // Отправляем всегда
          guestPhone, // Отправляем всегда
        }),
      });

      const data = await res.json();

      if (res.ok) {
        setSuccess(true);
      } else {
        setError(data.error || "Ошибка при отправке заявки");
      }
    } catch (err) {
      setError("Ошибка сети");
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="glass-panel p-12 text-center rounded-3xl">
        <CheckCircle2 size={64} className="text-green-500 mx-auto mb-4" />
        <h2 className="text-2xl font-bold dark:text-white mb-2">Заявка отправлена!</h2>
        <p className="text-gray-500 dark:text-gray-400">
          Мы получили вашу заявку на Trade-in. Наш менеджер свяжется с вами в ближайшее время для оценки устройства.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="glass-panel p-6 sm:p-8 rounded-3xl space-y-6">
      {error && <div className="bg-red-100 text-red-700 p-4 rounded-xl">{error}</div>}

      {/* ИМЯ И ТЕЛЕФОН ВСЕГДА СВЕРХУ */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pb-4 border-b border-gray-200 dark:border-slate-700">
        <div>
          <label className="block text-sm font-medium mb-2 dark:text-gray-300">Ваше имя *</label>
          <div className="relative">
            <User className="absolute left-3 top-3.5 text-gray-400" size={18} />
            <input required type="text" value={guestName} onChange={e => setGuestName(e.target.value)} className="w-full p-3 pl-10 rounded-xl border dark:border-slate-700 bg-gray-50 dark:bg-slate-800 dark:text-white outline-none focus:ring-2 focus:ring-blue-500" placeholder="Иван" />
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium mb-2 dark:text-gray-300">Телефон *</label>
          <div className="relative">
            <Phone className="absolute left-3 top-3.5 text-gray-400" size={18} />
            <input required type="tel" value={guestPhone} onChange={e => setGuestPhone(e.target.value)} className="w-full p-3 pl-10 rounded-xl border dark:border-slate-700 bg-gray-50 dark:bg-slate-800 dark:text-white outline-none focus:ring-2 focus:ring-blue-500" placeholder="+7 (999) 000-00-00" />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium mb-2 dark:text-gray-300">Что сдаете? *</label>
          <div className="relative">
            <Package className="absolute left-3 top-3.5 text-gray-400" size={18} />
            <input required type="text" value={deviceToTrade} onChange={e => setDeviceToTrade(e.target.value)} className="w-full p-3 pl-10 rounded-xl border dark:border-slate-700 bg-gray-50 dark:bg-slate-800 dark:text-white outline-none focus:ring-2 focus:ring-blue-500" placeholder="Например: PlayStation 4 Slim" />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium mb-2 dark:text-gray-300">Состояние *</label>
          <select value={condition} onChange={e => setCondition(e.target.value)} className="w-full p-3 rounded-xl border dark:border-slate-700 bg-gray-50 dark:bg-slate-800 dark:text-white outline-none focus:ring-2 focus:ring-blue-500">
            <option value="Идеальное">Идеальное</option>
            <option value="Хорошее">Хорошее</option>
            <option value="С дефектами">С дефектами</option>
            <option value="Не включается">Не включается</option>
          </select>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium mb-2 dark:text-gray-300">Комплектность</label>
        <div className="relative">
          <Box className="absolute left-3 top-3.5 text-gray-400" size={18} />
          <input type="text" value={completeness} onChange={e => setCompleteness(e.target.value)} className="w-full p-3 pl-10 rounded-xl border dark:border-slate-700 bg-gray-50 dark:bg-slate-800 dark:text-white outline-none focus:ring-2 focus:ring-blue-500" placeholder="Например: Коробка, джойстик, провода" />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium mb-2 dark:text-gray-300">Что хотите получить взамен? (необязательно)</label>
        <div className="relative">
          <HelpCircle className="absolute left-3 top-3.5 text-gray-400" size={18} />
          <input type="text" value={desiredDevice} onChange={e => setDesiredDevice(e.target.value)} className="w-full p-3 pl-10 rounded-xl border dark:border-slate-700 bg-gray-50 dark:bg-slate-800 dark:text-white outline-none focus:ring-2 focus:ring-blue-500" placeholder="Например: PlayStation 5" />
        </div>
      </div>

      <div className="pt-4 border-t border-gray-200 dark:border-slate-700">
        <label className="block text-sm font-medium mb-2 dark:text-gray-300">Как с вами связаться? *</label>
        <div className="flex gap-2 mb-4 flex-wrap">
          {[
            { id: "telegram", label: "Telegram" },
            { id: "max", label: "Max" },
            { id: "vk", label: "ВКонтакте" },
          ].map(m => (
            <button key={m.id} type="button" onClick={() => setContactMethod(m.id)} className={`flex-1 min-w-[100px] py-2 text-sm font-medium rounded-lg border transition-colors ${contactMethod === m.id ? 'bg-blue-500 text-white border-blue-500' : 'bg-transparent text-gray-600 dark:text-gray-400 border-gray-200 dark:border-slate-700'}`}>
              {m.label}
            </button>
          ))}
        </div>
        
        {contactMethod === "telegram" && (
          <div className="space-y-3">
            <input type="text" value={contactValue} onChange={e => setContactValue(e.target.value)} className="w-full p-3 rounded-xl border dark:border-slate-700 bg-gray-50 dark:bg-slate-800 dark:text-white outline-none focus:ring-2 focus:ring-blue-500" placeholder="@никнейм" />
            <input type="tel" value={contactPhone} onChange={e => setContactPhone(e.target.value)} className="w-full p-3 rounded-xl border dark:border-slate-700 bg-gray-50 dark:bg-slate-800 dark:text-white outline-none focus:ring-2 focus:ring-blue-500" placeholder="+7 (999) 000-00-00" />
            <p className="text-xs text-gray-500">* Заполните никнейм или телефон (можно оба)</p>
          </div>
        )}

        {contactMethod === "max" && (
          <div className="space-y-3">
            <input required type="tel" value={contactPhone} onChange={e => setContactPhone(e.target.value)} className="w-full p-3 rounded-xl border dark:border-slate-700 bg-gray-50 dark:bg-slate-800 dark:text-white outline-none focus:ring-2 focus:ring-blue-500" placeholder="+7 (999) 000-00-00" />
            <p className="text-xs text-gray-500">* Укажите номер телефона, привязанный к вашему аккаунту Max</p>
          </div>
        )}

        {contactMethod === "vk" && (
          <div className="space-y-3">
            <input required type="text" value={contactValue} onChange={e => setContactValue(e.target.value)} className="w-full p-3 rounded-xl border dark:border-slate-700 bg-gray-50 dark:bg-slate-800 dark:text-white outline-none focus:ring-2 focus:ring-blue-500" placeholder="Ссылка на профиль ВК или ID" />
            <p className="text-xs text-gray-500">* Обязательно для связи через ВКонтакте</p>
          </div>
        )}
      </div>

      <button type="submit" disabled={loading} className="w-full py-4 mt-4 bg-gradient-to-r from-blue-500 to-blue-700 text-white rounded-xl font-bold text-lg neon-hover shadow-lg disabled:opacity-50">
        {loading ? "Отправка..." : "Отправить заявку на оценку"}
      </button>
    </form>
  );
}