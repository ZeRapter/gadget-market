"use client";

import { useState, useEffect, Suspense } from "react";
import { useSession } from "next-auth/react";
import { useSearchParams } from "next/navigation";
import { CheckCircle2, User, Phone, Search, MessageSquare } from "lucide-react";

function FormContent() {
  const { data: session } = useSession();
  const searchParams = useSearchParams();
  const prefilledProduct = searchParams.get("product");

  const userPhone = (session?.user as any)?.phone;
  const userName = session?.user?.name;

  const [productName, setProductName] = useState(prefilledProduct || "");
  const [comment, setComment] = useState("");
  
  const [guestName, setGuestName] = useState("");
  const [guestPhone, setGuestPhone] = useState("");
  
  const [contactMethod, setContactMethod] = useState("telegram");
  const [contactValue, setContactValue] = useState(""); 
  const [contactPhone, setContactPhone] = useState(""); 

  const [agreeToData, setAgreeToData] = useState(false);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (userName) setGuestName(userName);
    if (userPhone) setGuestPhone(userPhone);
  }, [userName, userPhone]);

  const isVkRequired = contactMethod === "vk";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!agreeToData) return;
    setError("");

    if (isVkRequired && !contactValue.trim()) {
      setError("Для связи во ВКонтакте обязательно укажите ссылку или ID");
      return;
    }
    if (contactMethod === "telegram" && !contactValue.trim() && !contactPhone.trim()) {
      setError("Для Telegram укажите хотя бы один способ связи");
      return;
    }
    if (contactMethod === "max" && !contactPhone.trim()) {
      setError("Для связи в Max обязательно укажите номер телефона");
      return;
    }

    setLoading(true);

    try {
      const finalContactValue = [contactValue, contactPhone].filter(Boolean).join(" / ");

      const res = await fetch("/api/custom-request", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          productName, comment,
          guestName, guestPhone,
          contactMethod,
          contactValue: finalContactValue,
        }),
      });

      const data = await res.json();

      if (res.ok) {
        setSuccess(true);
      } else {
        setError(data.error || "Ошибка при отправке");
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
        <h2 className="text-2xl font-bold dark:text-white mb-2">Заявка принята!</h2>
        <p className="text-gray-500 dark:text-gray-400">
          Мы получили запрос. Наш менеджер свяжется с вами, как только найдет информацию по этому товару.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="glass-panel p-6 sm:p-8 rounded-3xl space-y-6">
      {error && <div className="bg-red-100 text-red-700 p-4 rounded-xl dark:bg-red-900/30 dark:text-red-400">{error}</div>}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pb-4 border-b border-gray-200 dark:border-slate-700">
        <div>
          <label className="block text-sm font-medium mb-2 dark:text-gray-300">Ваше имя *</label>
          <div className="relative">
            <User className="absolute left-3 top-3.5 text-gray-400 dark:text-gray-500" size={18} />
            <input required type="text" value={guestName} onChange={e => setGuestName(e.target.value)} className="w-full p-3 pl-10 rounded-xl border dark:border-slate-700 bg-gray-50 dark:bg-slate-800 dark:text-white outline-none focus:ring-2 focus:ring-blue-500" placeholder="Иван" />
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium mb-2 dark:text-gray-300">Телефон *</label>
          <div className="relative">
            <Phone className="absolute left-3 top-3.5 text-gray-400 dark:text-gray-500" size={18} />
            <input required type="tel" value={guestPhone} onChange={e => setGuestPhone(e.target.value)} className="w-full p-3 pl-10 rounded-xl border dark:border-slate-700 bg-gray-50 dark:bg-slate-800 dark:text-white outline-none focus:ring-2 focus:ring-blue-500" placeholder="+7 (999) 000-00-00" />
          </div>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium mb-2 dark:text-gray-300">Какой товар вы ищете? *</label>
        <div className="relative">
          <Search className="absolute left-3 top-3.5 text-gray-400 dark:text-gray-500" size={18} />
          <input required type="text" value={productName} onChange={e => setProductName(e.target.value)} className="w-full p-3 pl-10 rounded-xl border dark:border-slate-700 bg-gray-50 dark:bg-slate-800 dark:text-white outline-none focus:ring-2 focus:ring-blue-500" placeholder="Например: Коллекционная фигурка God of War" />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium mb-2 dark:text-gray-300">Комментарий (пожелания, цвет, размер)</label>
        <textarea value={comment} onChange={e => setComment(e.target.value)} rows={3} className="w-full p-3 rounded-xl border dark:border-slate-700 bg-gray-50 dark:bg-slate-800 dark:text-white outline-none focus:ring-2 focus:ring-blue-500" placeholder="Любые детали, которые нам помогут..." />
      </div>

      <div className="pt-4 border-t border-gray-200 dark:border-slate-700">
        <label className="block text-sm font-medium mb-2 dark:text-gray-300">
          Как с вами связаться? {isVkRequired ? <span className="text-red-500">*</span> : "(необязательно)"}
        </label>
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
          </div>
        )}

        {contactMethod === "max" && (
          <div className="space-y-3">
            <input required type="tel" value={contactPhone} onChange={e => setContactPhone(e.target.value)} className="w-full p-3 rounded-xl border dark:border-slate-700 bg-gray-50 dark:bg-slate-800 dark:text-white outline-none focus:ring-2 focus:ring-blue-500" placeholder="+7 (999) 000-00-00" />
          </div>
        )}

        {contactMethod === "vk" && (
          <div className="space-y-3">
            <input required type="text" value={contactValue} onChange={e => setContactValue(e.target.value)} className="w-full p-3 rounded-xl border dark:border-slate-700 bg-gray-50 dark:bg-slate-800 dark:text-white outline-none focus:ring-2 focus:ring-blue-500" placeholder="Ссылка на профиль ВК или ID" />
          </div>
        )}
      </div>

      <label className="flex items-start gap-3 cursor-pointer group pt-2">
        <div className="relative flex items-center mt-0.5 shrink-0">
          <input type="checkbox" required checked={agreeToData} onChange={(e) => setAgreeToData(e.target.checked)} className="peer w-5 h-5 border-2 border-gray-300 dark:border-slate-600 rounded bg-transparent checked:bg-blue-500 checked:border-blue-500 focus:ring-blue-500 focus:ring-2 transition-colors cursor-pointer appearance-none" />
          <svg className="absolute w-5 h-5 pointer-events-none hidden peer-checked:block text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
        </div>
        <span className="text-sm text-gray-700 dark:text-gray-300 group-hover:text-gray-900 dark:group-hover:text-white transition-colors select-none">
          Я подтверждаю, что данные указаны верно.
        </span>
      </label>

      <button type="submit" disabled={loading || !agreeToData} className="w-full py-4 mt-4 bg-gradient-to-r from-blue-500 to-blue-700 text-white rounded-xl font-bold text-lg neon-hover shadow-lg disabled:opacity-50 disabled:cursor-not-allowed">
        {loading ? "Отправка..." : "Отправить заявку"}
      </button>
    </form>
  );
}

export default function CustomRequestForm() {
  return (
    <Suspense fallback={<div className="text-center py-10 text-gray-500">Загрузка...</div>}>
      <FormContent />
    </Suspense>
  );
}