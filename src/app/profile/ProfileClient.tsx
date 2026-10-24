"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { User, Package, Clock, ChevronRight, CheckCircle2, AlertCircle, Truck } from "lucide-react";

export default function ProfileClient({ user, initialBookings, initialOrders }: { user: any, initialBookings: any[], initialOrders: any[] }) {
  const router = useRouter();
  const { update } = useSession(); 
  const [activeTab, setActiveTab] = useState<"bookings" | "orders" | "settings">("bookings");
  
  const [name, setName] = useState(user.name || "");
  const [phone, setPhone] = useState(user.phone || "");
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setSaveSuccess(false);
    try {
      const res = await fetch("/api/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, phone }),
      });
      if (res.ok) {
        setSaveSuccess(true);
        await update({ name, phone });
        router.refresh();
        setTimeout(() => setSaveSuccess(false), 3000);
      } else {
        alert("Ошибка при сохранении");
      }
    } catch (err) {
      alert("Ошибка сети");
    } finally {
      setSaving(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "PENDING": return <span className="bg-yellow-100 text-yellow-700 px-2 py-1 rounded text-xs font-bold">Ожидает</span>;
      case "CONFIRMED": return <span className="bg-blue-100 text-blue-700 px-2 py-1 rounded text-xs font-bold">Подтверждено</span>;
      case "READY": return <span className="bg-green-100 text-green-700 px-2 py-1 rounded text-xs font-bold">Готово к выдаче</span>;
      case "PROCESSING": return <span className="bg-blue-100 text-blue-700 px-2 py-1 rounded text-xs font-bold">В обработке</span>;
      case "SHIPPED": return <span className="bg-purple-100 text-purple-700 px-2 py-1 rounded text-xs font-bold">Отправлен</span>;
      case "COMPLETED": return <span className="bg-green-100 text-green-700 px-2 py-1 rounded text-xs font-bold">Завершен</span>;
      case "CANCELLED": return <span className="bg-red-100 text-red-700 px-2 py-1 rounded text-xs font-bold">Отменено</span>;
      case "EXPIRED": return <span className="bg-gray-100 text-gray-700 px-2 py-1 rounded text-xs font-bold">Истекло</span>;
      default: return null;
    }
  };

  return (
    <div className="flex flex-col lg:flex-row gap-8">
      <aside className="w-full lg:w-64 shrink-0">
        <div className="glass-panel rounded-2xl p-4 sticky top-24">
          <div className="flex items-center gap-3 px-4 py-3 mb-4 border-b border-gray-200 dark:border-slate-700">
            <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-full flex items-center justify-center">
              <User size={20} />
            </div>
            <div className="overflow-hidden">
              <p className="font-bold dark:text-white truncate">{name || "Пользователь"}</p>
              <p className="text-xs text-gray-500 truncate">{user.email}</p>
            </div>
          </div>

          <nav className="flex flex-col gap-1">
            <button onClick={() => setActiveTab("bookings")} className={`flex items-center gap-3 px-4 py-2.5 rounded-xl transition-colors text-sm font-medium ${activeTab === "bookings" ? "bg-blue-50 dark:bg-slate-800 text-blue-600 dark:text-blue-400" : "text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-slate-800/50"}`}><Package size={18} /> Мои брони</button>
            <button onClick={() => setActiveTab("orders")} className={`flex items-center gap-3 px-4 py-2.5 rounded-xl transition-colors text-sm font-medium ${activeTab === "orders" ? "bg-blue-50 dark:bg-slate-800 text-blue-600 dark:text-blue-400" : "text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-slate-800/50"}`}><Truck size={18} /> Мои заказы</button>
            <button onClick={() => setActiveTab("settings")} className={`flex items-center gap-3 px-4 py-2.5 rounded-xl transition-colors text-sm font-medium ${activeTab === "settings" ? "bg-blue-50 dark:bg-slate-800 text-blue-600 dark:text-blue-400" : "text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-slate-800/50"}`}><User size={18} /> Настройки</button>
          </nav>
        </div>
      </aside>

      <div className="flex-1">
        {activeTab === "bookings" && (
          <div>
            <h1 className="text-2xl font-bold dark:text-white mb-6">Мои бронирования</h1>
            {initialBookings.length === 0 ? (
              <div className="glass-panel p-12 text-center rounded-2xl"><Package size={48} className="mx-auto text-gray-300 mb-4" /><p className="text-gray-500 mb-6">У вас пока нет активных броней.</p><Link href="/catalog" className="px-6 py-3 bg-blue-500 text-white rounded-xl font-medium">В каталог</Link></div>
            ) : (
              <div className="flex flex-col gap-4">
                {initialBookings.map((booking) => (
                  <div key={booking.id} className="glass-panel rounded-2xl p-4 flex flex-col gap-4">
                    {booking.status === "CANCELLED" && booking.cancelReason && (
                      <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 p-3 rounded-xl flex items-start gap-2">
                        <AlertCircle className="text-red-500 shrink-0 mt-0.5" size={16} />
                        <div><p className="text-xs font-bold text-red-700">Бронь отменена</p><p className="text-sm text-red-600 mt-1">Причина: {booking.cancelReason}</p></div>
                      </div>
                    )}

                    {/* КОД ВЫДАЧИ ДЛЯ БРОНИ */}
                    {["CONFIRMED", "READY"].includes(booking.status) && booking.pickupCode && (
                      <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-900/50 p-3 rounded-xl flex items-center justify-between">
                        <div>
                          <p className="text-xs font-bold text-blue-700 dark:text-blue-400">Код получения брони:</p>
                          <p className="text-[10px] text-blue-500 mt-1">Назовите этот код продавцу при получении.</p>
                        </div>
                        <p className="text-2xl font-mono font-bold text-blue-600 dark:text-blue-300 tracking-widest bg-white dark:bg-slate-800 px-3 py-1 rounded-lg">
                          {booking.pickupCode}
                        </p>
                      </div>
                    )}

                    <div className="flex items-center gap-3 mb-2">
                      {getStatusBadge(booking.status)}
                      <span className="text-xs text-gray-400 flex items-center gap-1"><Clock size={12} /> {new Date(booking.createdAt).toLocaleString('ru-RU', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' })}</span>
                      <span className="text-xs font-medium text-gray-500 bg-gray-100 dark:bg-slate-800 px-2 py-0.5 rounded">Филиал: {booking.branch === "ANGARSK" ? "Ангарск" : "Иркутск"}</span>
                    </div>
                    
                    <div className="space-y-3">
                      {booking.items.map((item: any) => (
                        <div key={item.id} className="flex flex-col sm:flex-row sm:items-center justify-between bg-white/50 dark:bg-slate-800/50 p-2 rounded-xl gap-2">
                          <div className="flex items-center gap-3">
                            <div className="w-12 h-12 shrink-0 bg-gray-100 dark:bg-slate-800 rounded-lg overflow-hidden flex items-center justify-center p-1">
                              {item.product.images?.[0] ? <img src={item.product.images[0]} alt={item.product.name} className="w-full h-full object-contain mix-blend-multiply dark:mix-blend-normal" /> : <Package size={20} className="text-gray-400" />}
                            </div>
                            <div>
                              <Link href={`/product/${item.product.id}`} className="text-sm font-bold dark:text-white hover:text-blue-500 line-clamp-1">{item.product.name}</Link>
                              <p className="text-xs text-gray-500">{item.quantity} шт. × {(item.product.priceCash / 100).toLocaleString('ru-RU')} ₽</p>
                            </div>
                          </div>
                          <Link href={`/product/${item.product.id}`} className="text-xs text-blue-500 hover:underline flex items-center gap-1 self-start sm:self-center shrink-0">К товару <ChevronRight size={14} /></Link>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === "orders" && (
          <div>
            <h1 className="text-2xl font-bold dark:text-white mb-6">Мои заказы</h1>
            {initialOrders.length === 0 ? (
              <div className="glass-panel p-12 text-center rounded-2xl"><Truck size={48} className="mx-auto text-gray-300 mb-4" /><p className="text-gray-500 mb-6">У вас пока нет заказов с доставкой.</p><Link href="/catalog" className="px-6 py-3 bg-blue-500 text-white rounded-xl font-medium">В каталог</Link></div>
            ) : (
              <div className="flex flex-col gap-4">
                {initialOrders.map((order) => (
                  <div key={order.id} className="glass-panel rounded-2xl p-4 flex flex-col gap-4">
                    {order.status === "CANCELLED" && order.cancelReason && (
                      <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 p-3 rounded-xl flex items-start gap-2">
                        <AlertCircle className="text-red-500 shrink-0 mt-0.5" size={16} />
                        <div><p className="text-xs font-bold text-red-700">Заказ отменен</p><p className="text-sm text-red-600 mt-1">Причина: {order.cancelReason}</p></div>
                      </div>
                    )}

                    <div className="flex items-center gap-3 mb-2 flex-wrap">
                      {getStatusBadge(order.status)}
                      <span className="text-xs text-gray-400 flex items-center gap-1"><Clock size={12} /> {new Date(order.createdAt).toLocaleString('ru-RU', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' })}</span>
                      <span className="text-xs font-medium text-gray-500 bg-gray-100 dark:bg-slate-800 px-2 py-0.5 rounded flex items-center gap-1"><Truck size={12} /> {order.deliveryService}</span>
                    </div>
                    
                    <div className="space-y-3">
                      {order.items.map((item: any) => (
                        <div key={item.id} className="flex flex-col sm:flex-row sm:items-center justify-between bg-white/50 dark:bg-slate-800/50 p-2 rounded-xl gap-2">
                          <div className="flex items-center gap-3">
                            <div className="w-12 h-12 shrink-0 bg-gray-100 dark:bg-slate-800 rounded-lg overflow-hidden flex items-center justify-center p-1">
                              {item.product.images?.[0] ? <img src={item.product.images[0]} alt={item.product.name} className="w-full h-full object-contain mix-blend-multiply dark:mix-blend-normal" /> : <Package size={20} className="text-gray-400" />}
                            </div>
                            <div>
                              <Link href={`/product/${item.product.id}`} className="text-sm font-bold dark:text-white hover:text-blue-500 line-clamp-1">{item.product.name}</Link>
                              <p className="text-xs text-gray-500">{item.quantity} шт. × {(item.price / 100).toLocaleString('ru-RU')} ₽</p>
                            </div>
                          </div>
                          <Link href={`/product/${item.product.id}`} className="text-xs text-blue-500 hover:underline flex items-center gap-1 self-start sm:self-center shrink-0">К товару <ChevronRight size={14} /></Link>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === "settings" && (
          <div className="glass-panel p-8 rounded-2xl">
            <h2 className="text-xl font-bold dark:text-white mb-6">Настройки профиля</h2>
            <form onSubmit={handleSaveProfile} className="space-y-4 max-w-md">
              <div>
                <label className="block text-sm font-medium mb-1 dark:text-gray-300">Имя</label>
                <input type="text" value={name} onChange={e => setName(e.target.value)} className="w-full p-3 rounded-xl border dark:border-slate-700 bg-transparent dark:text-white focus:ring-2 focus:ring-blue-500 outline-none" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1 dark:text-gray-300">Email (нельзя изменить)</label>
                <input type="email" defaultValue={user.email || ""} disabled className="w-full p-3 rounded-xl border dark:border-slate-700 bg-gray-100 dark:bg-slate-800 dark:text-gray-500 cursor-not-allowed" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1 dark:text-gray-300">Телефон</label>
                <input type="tel" value={phone} onChange={e => setPhone(e.target.value)} className="w-full p-3 rounded-xl border dark:border-slate-700 bg-transparent dark:text-white focus:ring-2 focus:ring-blue-500 outline-none" placeholder="+7 (999) 000-00-00" />
              </div>
              
              <div className="flex items-center gap-4 pt-2">
                <button type="submit" disabled={saving} className="px-6 py-2 bg-blue-500 text-white rounded-xl font-medium hover:bg-blue-600 transition-colors disabled:opacity-50">
                  {saving ? "Сохранение..." : "Сохранить изменения"}
                </button>
                {saveSuccess && <span className="text-green-500 text-sm font-medium flex items-center gap-1"><CheckCircle2 size={16} /> Сохранено!</span>}
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}