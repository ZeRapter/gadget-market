"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { X, CheckCircle2, User, Phone, ShieldCheck } from "lucide-react";

export default function BookingModal({ 
  productId, 
  productName, 
  isOpen, 
  onClose 
}: { 
  productId: string, 
  productName: string, 
  isOpen: boolean, 
  onClose: () => void 
}) {
  const { data: session } = useSession();
  const userPhone = (session?.user as any)?.phone;

  const [branch, setBranch] = useState("ANGARSK");
  const [comment, setComment] = useState("");
  
  const [guestName, setGuestName] = useState("");
  const [phone, setPhone] = useState("");
  
  const [contactMethod, setContactMethod] = useState("telegram");
  const [contactValue, setContactValue] = useState("");
  
  // Стейт для галочки
  const [agreeToData, setAgreeToData] = useState(false);
  
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [pickupCode, setPickupCode] = useState(""); // Стейт для кода
  const [error, setError] = useState("");

  useEffect(() => {
    if (userPhone) setPhone(userPhone);
  }, [userPhone]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!agreeToData) return; // Дополнительная защита

    setLoading(true);
    setError("");

    const finalContactValue = contactMethod === "phone" ? phone : contactValue;

    if (contactMethod === "vk" && (!finalContactValue || !finalContactValue.trim())) {
      setError("Для связи во ВКонтакте укажите ссылку или ID");
      setLoading(false);
      return;
    }

    try {
      const res = await fetch("/api/bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          productId, branch, comment, 
          guestName: session ? undefined : guestName,
          guestPhone: phone, 
          contactMethod, 
          contactValue: finalContactValue 
        }),
      });

      const data = await res.json();

      if (res.ok) {
        setPickupCode(data.pickupCode); // Сохраняем полученный код
        setSuccess(true);
      } else {
        setError(data.error || "Ошибка при бронировании");
      }
    } catch (err) {
      setError("Ошибка сети");
    } finally {
      setLoading(false);
    }
  };

  const getPlaceholder = () => {
    if (contactMethod === "vk") return "Ссылка на профиль ВК или ваш ID (обязательно)";
    if (contactMethod === "telegram") return "@ваш_никнейм (необязательно)";
    if (contactMethod === "max") return "Ваш номер в Max (необязательно)";
    return "";
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm overflow-y-auto">
      <div className="bg-white dark:bg-slate-900 w-full max-w-md rounded-3xl shadow-2xl relative my-auto">
        
        <button onClick={onClose} className="absolute top-4 right-4 p-2 text-gray-400 hover:text-red-500 transition-colors z-10">
          <X size={20} />
        </button>

        <div className="p-8 max-h-[90vh] overflow-y-auto">
          {success ? (
            <div className="text-center py-4">
              <CheckCircle2 size={64} className="text-green-500 mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Успешно!</h2>
              <p className="text-gray-500 dark:text-gray-400 mb-6">
                Товар «{productName}» забронирован. Мы свяжемся с вами для подтверждения.
              </p>

              {/* БЛОК С КОДОМ */}
              {pickupCode && (
                <div className="bg-blue-50 dark:bg-slate-800/80 border-2 border-dashed border-blue-300 dark:border-blue-700 rounded-2xl p-4 mb-6">
                  <p className="text-xs font-bold text-blue-600 dark:text-blue-400 uppercase tracking-wider mb-2 flex items-center justify-center gap-2">
                    <ShieldCheck size={16} /> Ваш код получения
                  </p>
                  <div className="text-4xl font-mono font-bold text-gray-900 dark:text-white tracking-[0.2em] mb-2">
                    {pickupCode}
                  </div>
                  <p className="text-xs text-gray-600 dark:text-gray-400">
                    Обязательно <strong>сохраните или сфотографируйте</strong> этот код для получения товара в магазине.
                  </p>
                </div>
              )}

              <button onClick={onClose} className="px-6 py-3 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700 transition-colors w-full">
                Отлично
              </button>
            </div>
          ) : (
            <>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Бронирование</h2>
              <p className="text-sm text-gray-500 mb-6 truncate">Товар: {productName}</p>

              {error && <div className="bg-red-100 text-red-700 p-3 rounded-xl mb-4 text-sm">{error}</div>}

              <form onSubmit={handleSubmit} className="space-y-4">
                
                {!session && (
                  <div>
                    <label className="block text-sm font-medium mb-2 dark:text-gray-300">Ваше имя *</label>
                    <div className="relative">
                      <User className="absolute left-3 top-3.5 text-gray-400" size={18} />
                      <input required type="text" value={guestName} onChange={e => setGuestName(e.target.value)} className="w-full p-3 pl-10 text-sm rounded-xl border dark:border-slate-700 bg-gray-50 dark:bg-slate-800 dark:text-white outline-none focus:ring-2 focus:ring-blue-500" placeholder="Иван" />
                    </div>
                  </div>
                )}

                <div>
                  <label className="block text-sm font-medium mb-2 dark:text-gray-300">Номер телефона *</label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-3.5 text-gray-400" size={18} />
                    <input required type="tel" value={phone} onChange={e => setPhone(e.target.value)} className="w-full p-3 pl-10 text-sm rounded-xl border dark:border-slate-700 bg-gray-50 dark:bg-slate-800 dark:text-white outline-none focus:ring-2 focus:ring-blue-500" placeholder="+7 (999) 000-00-00" />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2 dark:text-gray-300">Где будете забирать?</label>
                  <select value={branch} onChange={e => setBranch(e.target.value)} className="w-full p-3 rounded-xl border dark:border-slate-700 bg-gray-50 dark:bg-slate-800 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none">
                    <option value="ANGARSK">Ангарск (192 квартал, 13)</option>
                    <option value="IRKUTSK">Иркутск (Академическая 26)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2 dark:text-gray-300">Как с вами связаться? {contactMethod === "vk" ? <span className="text-red-500">*</span> : "(необязательно)"}</label>
                  <div className="flex gap-1 mb-2">
                    {[
                      { id: "telegram", label: "TG" },
                      { id: "max", label: "Max" },
                      { id: "vk", label: "ВК" },
                      { id: "phone", label: "Звонок" },
                    ].map(m => (
                      <button 
                        key={m.id} 
                        type="button"
                        onClick={() => setContactMethod(m.id)}
                        className={`flex-1 py-2 text-xs font-medium rounded-lg border transition-colors ${contactMethod === m.id ? 'bg-blue-500 text-white border-blue-500' : 'bg-transparent text-gray-600 dark:text-gray-400 border-gray-200 dark:border-slate-700'}`}
                      >
                        {m.label}
                      </button>
                    ))}
                  </div>
                  {contactMethod !== "phone" && (
                    <input required={contactMethod === "vk"} type="text" value={contactValue} onChange={e => setContactValue(e.target.value)} className="w-full p-3 text-sm rounded-xl border dark:border-slate-700 bg-gray-50 dark:bg-slate-800 dark:text-white outline-none focus:ring-2 focus:ring-blue-500" placeholder={getPlaceholder()} />
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2 dark:text-gray-300">Комментарий (необязательно)</label>
                  <textarea value={comment} onChange={e => setComment(e.target.value)} rows={2} className="w-full p-3 text-sm rounded-xl border dark:border-slate-700 bg-gray-50 dark:bg-slate-800 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none" placeholder="Например: буду в субботу" />
                </div>

                {/* ЧЕКБОКС ПОДТВЕРЖДЕНИЯ */}
                <label className="flex items-start gap-3 cursor-pointer group pt-2">
                  <div className="relative flex items-center mt-0.5 shrink-0">
                    <input 
                      type="checkbox" 
                      required
                      checked={agreeToData}
                      onChange={(e) => setAgreeToData(e.target.checked)}
                      className="peer w-5 h-5 border-2 border-gray-300 dark:border-slate-600 rounded bg-transparent checked:bg-blue-500 checked:border-blue-500 focus:ring-blue-500 focus:ring-2 transition-colors cursor-pointer appearance-none"
                    />
                    <svg className="absolute w-5 h-5 pointer-events-none hidden peer-checked:block text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
                  </div>
                  <span className="text-xs text-gray-600 dark:text-gray-400 group-hover:text-gray-900 dark:group-hover:text-white transition-colors select-none">
                    Я подтверждаю, что контактные данные указаны верно.
                  </span>
                </label>

                <button 
                  type="submit" 
                  disabled={loading || !agreeToData} 
                  className="w-full py-3 mt-2 bg-gradient-to-r from-blue-500 to-blue-700 text-white rounded-xl font-bold hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? "Отправка..." : "Подтвердить бронь"}
                </button>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  );
}