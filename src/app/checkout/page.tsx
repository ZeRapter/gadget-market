"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useSession } from "next-auth/react";
import { useCart } from "@/context/CartContext";
import Header from "@/components/Header";
import Link from "next/link";
import { ArrowLeft, Truck, User, Store, Mail } from "lucide-react";

function CheckoutForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const isBooking = searchParams.get("mode") === "booking";
  
  const { data: session } = useSession();
  const { cart, clearCart } = useCart();
  const userPhone = (session?.user as any)?.phone;

  const [deliveryService, setDeliveryService] = useState("СДЭК");
  const [address, setAddress] = useState("");
  const [branch, setBranch] = useState("ANGARSK");
  const [comment, setComment] = useState("");
  
  const [guestName, setGuestName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [contactMethod, setContactMethod] = useState("telegram");
  const [contactValue, setContactValue] = useState("");
  
  const [agreeToData, setAgreeToData] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (userPhone) setPhone(userPhone);
  }, [userPhone]);

  const isVkRequired = contactMethod === "vk";
  const totalCash = cart.reduce((sum, item) => sum + (item.priceCash * item.quantity), 0);

  if (cart.length === 0) {
    return (
      <div className="max-w-3xl mx-auto mt-20 glass-panel p-12 text-center rounded-3xl">
        <h2 className="text-2xl font-bold dark:text-white mb-4">Корзина пуста</h2>
        <Link href="/catalog" className="px-8 py-3 bg-blue-500 text-white rounded-xl font-bold hover:bg-blue-600">В каталог</Link>
      </div>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const finalContactValue = contactMethod === "phone" ? phone : contactValue;

    if (isVkRequired && !finalContactValue.trim()) {
      setError("Для связи во ВКонтакте укажите ссылку или ID");
      setLoading(false);
      return;
    }

    try {
      const url = isBooking ? "/api/bookings/cart" : "/api/orders";
      
      const payload = isBooking 
        ? { items: cart, branch, comment, guestName: session ? undefined : guestName, guestPhone: phone, guestEmail: email, contactMethod, contactValue: finalContactValue }
        : { items: cart, deliveryService, address, comment, guestName: session ? undefined : guestName, guestPhone: phone, guestEmail: email, contactMethod, contactValue: finalContactValue };

      const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (res.ok) {
        clearCart();
        const type = isBooking ? "booking" : "order";
        const id = isBooking ? data.bookingId : data.orderId;
        router.push(`/checkout/success?id=${id}&type=${type}`);
      } else {
        setError(data.error || "Ошибка при оформлении");
      }
    } catch (err) {
      setError("Ошибка сети");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto mt-8">
      <Link href="/cart" className="text-blue-500 hover:text-blue-600 flex items-center gap-1 text-sm font-medium mb-6">
        <ArrowLeft size={16} /> Назад в корзину
      </Link>
      <h1 className="text-3xl font-bold dark:text-white mb-8">{isBooking ? "Оформление брони" : "Оформление заказа"}</h1>

      {error && <div className="bg-red-100 text-red-700 p-4 rounded-xl mb-6">{error}</div>}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="glass-panel p-6 rounded-2xl">
          <h2 className="text-lg font-bold dark:text-white mb-4 flex items-center gap-2"><User size={20} className="text-blue-500" /> Контактные данные</h2>

          {!session && (
            <div className="mb-4">
              <label className="block text-sm font-medium mb-2 dark:text-gray-300">Ваше имя *</label>
              <input required type="text" value={guestName} onChange={e => setGuestName(e.target.value)} className="w-full p-3 rounded-xl border dark:border-slate-700 bg-gray-50 dark:bg-slate-800 dark:text-white outline-none focus:ring-2 focus:ring-blue-500" placeholder="Иван" />
            </div>
          )}

          <div className="mb-4">
            <label className="block text-sm font-medium mb-2 dark:text-gray-300">Телефон *</label>
            <input required type="tel" value={phone} onChange={e => setPhone(e.target.value)} className="w-full p-3 rounded-xl border dark:border-slate-700 bg-gray-50 dark:bg-slate-800 dark:text-white outline-none focus:ring-2 focus:ring-blue-500" placeholder="+7 (999) 000-00-00" />
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium mb-2 dark:text-gray-300">
              Email <span className="text-xs text-gray-500 dark:text-gray-400 font-normal">(необязательно)</span>
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-3.5 text-gray-400 dark:text-gray-500" size={18} />
              <input type="email" value={email} onChange={e => setEmail(e.target.value)} className="w-full p-3 pl-10 rounded-xl border dark:border-slate-700 bg-gray-50 dark:bg-slate-800 dark:text-white outline-none focus:ring-2 focus:ring-blue-500" placeholder="you@example.com" />
            </div>
            <p className="text-[11px] text-gray-500 dark:text-gray-400 mt-1">Укажите почту, чтобы получать уведомления о статусе заказа.</p>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2 dark:text-gray-300">Как с вами связаться? {isVkRequired ? <span className="text-red-500">*</span> : <span className="text-xs text-gray-500 dark:text-gray-400">(необязательно)</span>}</label>
            <div className="flex gap-2 mb-2 flex-wrap">
              {[{ id: "telegram", label: "Telegram" }, { id: "max", label: "Max" }, { id: "vk", label: "ВКонтакте" }, { id: "phone", label: "Звонок" }].map(m => (
                <button key={m.id} type="button" onClick={() => setContactMethod(m.id)} className={`flex-1 min-w-[80px] py-2 text-xs font-medium rounded-lg border transition-colors ${contactMethod === m.id ? 'bg-blue-500 text-white border-blue-500' : 'bg-transparent text-gray-600 dark:text-gray-400 border-gray-200 dark:border-slate-700'}`}>
                  {m.label}
                </button>
              ))}
            </div>
            {contactMethod !== "phone" && (
              <input required={isVkRequired} type="text" value={contactValue} onChange={e => setContactValue(e.target.value)} className={`w-full p-3 rounded-xl border bg-gray-50 dark:bg-slate-800 dark:text-white outline-none focus:ring-2 focus:ring-blue-500 ${isVkRequired && !contactValue ? 'border-red-400' : 'dark:border-slate-700'}`} placeholder={contactMethod === "vk" ? "Ссылка на ВК/ID (обязательно)" : "@ваш_никнейм"} />
            )}
            {contactMethod === "phone" && (
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Мы позвоним вам на указанный выше номер.</p>
            )}
          </div>
        </div>

        {isBooking ? (
          <div className="glass-panel p-6 rounded-2xl">
            <h2 className="text-lg font-bold dark:text-white mb-4 flex items-center gap-2"><Store size={20} className="text-blue-500" /> Где будете забирать?</h2>
            <select value={branch} onChange={e => setBranch(e.target.value)} className="w-full p-3 rounded-xl border dark:border-slate-700 bg-gray-50 dark:bg-slate-800 dark:text-white">
              <option value="ANGARSK">Ангарск (192 квартал, 13)</option>
              <option value="IRKUTSK">Иркутск (Академическая 26)</option>
            </select>
          </div>
        ) : (
          <div className="glass-panel p-6 rounded-2xl">
            <h2 className="text-lg font-bold dark:text-white mb-4 flex items-center gap-2"><Truck size={20} className="text-blue-500" /> Доставка</h2>
            <div className="mb-4">
              <label className="block text-sm font-medium mb-2 dark:text-gray-300">Служба доставки *</label>
              <select value={deliveryService} onChange={e => setDeliveryService(e.target.value)} className="w-full p-3 rounded-xl border dark:border-slate-700 bg-gray-50 dark:bg-slate-800 dark:text-white">
                <option value="СДЭК">СДЭК</option>
                <option value="Почта России">Почта России</option>
                <option value="Boxberry">Boxberry</option>
                <option value="5Post">5Post</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-2 dark:text-gray-300">Адрес доставки</label>
              <input type="text" value={address} onChange={e => setAddress(e.target.value)} className="w-full p-3 rounded-xl border dark:border-slate-700 bg-gray-50 dark:bg-slate-800 dark:text-white" placeholder="Город, улица, дом, квартира" />
            </div>
          </div>
        )}

        <div className="glass-panel p-6 rounded-2xl">
          <label className="block text-sm font-medium mb-2 dark:text-gray-300">Комментарий (необязательно)</label>
          <textarea value={comment} onChange={e => setComment(e.target.value)} rows={2} className="w-full p-3 rounded-xl border dark:border-slate-700 bg-gray-50 dark:bg-slate-800 dark:text-white" placeholder="..." />
        </div>

        <div className="glass-panel p-6 rounded-2xl flex flex-col gap-4">
          <label className="flex items-start gap-3 cursor-pointer group">
            <div className="relative flex items-center mt-0.5 shrink-0">
              <input type="checkbox" required checked={agreeToData} onChange={(e) => setAgreeToData(e.target.checked)} className="peer w-5 h-5 border-2 border-gray-300 dark:border-slate-600 rounded bg-transparent checked:bg-blue-500 checked:border-blue-500 focus:ring-blue-500 focus:ring-2 transition-colors cursor-pointer appearance-none" />
              <svg className="absolute w-5 h-5 pointer-events-none hidden peer-checked:block text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
            </div>
            <span className="text-sm text-gray-700 dark:text-gray-300 group-hover:text-gray-900 dark:group-hover:text-white transition-colors select-none">
              Я подтверждаю, что <strong>контактные данные</strong> (имя, телефон, мессенджер) указаны верно, и со мной можно связаться для подтверждения.
            </span>
          </label>

          <div className="flex flex-col sm:flex-row justify-between items-center gap-4 border-t border-gray-200 dark:border-slate-700 pt-4">
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Итого:</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{(totalCash / 100).toLocaleString('ru-RU')} ₽</p>
            </div>
            <button type="submit" disabled={loading || !agreeToData} className="w-full sm:w-auto px-8 py-4 bg-gradient-to-r from-blue-500 to-blue-700 text-white rounded-xl font-bold text-lg neon-hover shadow-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all">
              {loading ? "Отправка..." : isBooking ? "Подтвердить бронь" : "Подтвердить заказ"}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}

export default function CheckoutPage() {
  return (
    <main className="min-h-screen relative overflow-hidden p-4 pb-20">
      <div className="fixed top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-500 rounded-full mix-blend-multiply dark:mix-blend-screen filter blur-[100px] opacity-30 dark:opacity-20"></div>
      <div className="fixed top-[20%] right-[-10%] w-[30%] h-[50%] bg-purple-500 rounded-full mix-blend-multiply dark:mix-blend-screen filter blur-[100px] opacity-30 dark:opacity-20"></div>
      <div className="relative z-10">
        <Header />
        <Suspense fallback={<div className="text-center py-20 dark:text-white">Загрузка формы...</div>}>
          <CheckoutForm />
        </Suspense>
      </div>
    </main>
  );
}