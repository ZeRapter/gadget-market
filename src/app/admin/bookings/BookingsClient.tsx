"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { CheckCircle, XCircle, Clock, Phone, User, Package, Send, MessageCircle, ShieldCheck } from "lucide-react";

export default function BookingsClient({ initialBookings }: { initialBookings: any[] }) {
  const router = useRouter();
  const [loadingId, setLoadingId] = useState<string | null>(null);

  const updateStatus = async (id: string, status: string, reason?: string) => {
    setLoadingId(id);
    try {
      const res = await fetch(`/api/admin/bookings/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status, cancelReason: reason }),
      });
      if (res.ok) router.refresh();
    } catch (error) {
      alert("Ошибка сети");
    } finally {
      setLoadingId(null);
    }
  };

  const handleCancel = (id: string) => {
    const reason = window.prompt("Укажите причину отмены брони (клиент увидит этот текст):");
    if (reason !== null && reason.trim() !== "") {
      updateStatus(id, "CANCELLED", reason);
    } else if (reason !== null) {
      alert("Причина отмены обязательна!");
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "PENDING": return <span className="bg-yellow-100 text-yellow-700 px-2 py-1 rounded text-xs font-bold">Ожидает</span>;
      case "CONFIRMED": return <span className="bg-blue-100 text-blue-700 px-2 py-1 rounded text-xs font-bold">Подтверждено</span>;
      case "READY": return <span className="bg-green-100 text-green-700 px-2 py-1 rounded text-xs font-bold">Готово</span>;
      case "CANCELLED": return <span className="bg-red-100 text-red-700 px-2 py-1 rounded text-xs font-bold">Отменено</span>;
      default: return null;
    }
  };

  if (initialBookings.length === 0) return <div className="bg-white dark:bg-slate-900 rounded-2xl border border-gray-200 dark:border-slate-800 p-12 text-center text-gray-500 dark:text-gray-400">Броней пока нет.</div>;

  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-gray-200 dark:border-slate-800 overflow-hidden">
      <table className="w-full text-left border-collapse">
        <thead>
          <tr className="bg-gray-50 dark:bg-slate-800/50 border-b border-gray-200 dark:border-slate-800 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
            <th className="p-4 w-1/3">Товары в брони</th>
            <th className="p-4">Клиент и связь</th>
            <th className="p-4">Филиал / Статус</th>
            <th className="p-4 text-right">Действия</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100 dark:divide-slate-800">
          {initialBookings.map((booking) => {
            const clientPhone = booking.guestPhone || booking.user?.phone;
            const clientName = booking.user ? booking.user.name : booking.guestName || "Гость";

            return (
              <tr key={booking.id} className="hover:bg-gray-50 dark:hover:bg-slate-800/30 transition-colors">
                <td className="p-4">
                  <div className="flex flex-col gap-3">
                    {booking.items.map((item: any) => (
                      <div key={item.id} className="flex items-center gap-2">
                        <div className="w-8 h-8 bg-gray-100 dark:bg-slate-800 rounded shrink-0 flex items-center justify-center"><Package size={14} className="text-gray-500 dark:text-gray-400" /></div>
                        <div>
                          <p className="font-bold text-xs text-gray-900 dark:text-white line-clamp-2">{item.product.name}</p>
                          <p className="text-[10px] text-gray-500 dark:text-gray-400">Арт: {item.product.sku} | {item.quantity} шт.</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </td>

                <td className="p-4">
                  <div className="flex flex-col gap-1.5">
                    <div className="flex items-center gap-1.5 text-sm font-bold text-gray-900 dark:text-white">
                      <User size={14} className="text-gray-400 dark:text-gray-500" /> {clientName}
                      {booking.user && <span className="text-[10px] bg-slate-100 dark:bg-slate-800 text-gray-500 dark:text-gray-400 px-1.5 py-0.5 rounded">Зарег.</span>}
                    </div>
                    {clientPhone && (
                      <a href={`tel:${clientPhone}`} className="flex items-center gap-1.5 text-sm font-semibold text-green-600 dark:text-green-400 hover:underline">
                        <Phone size={14} /> {clientPhone}
                      </a>
                    )}
                    {booking.contactMethod && (
                      <div className="flex items-center gap-1.5 text-xs text-blue-500 dark:text-blue-400 font-medium bg-blue-50 dark:bg-blue-900/20 px-2 py-1 rounded-md w-max">
                        {booking.contactMethod === "telegram" && <Send size={12} />}
                        {booking.contactMethod === "vk" && <MessageCircle size={12} />}
                        {booking.contactMethod === "max" && <MessageCircle size={12} />}
                        {booking.contactMethod === "phone" && <Phone size={12} />}
                        <span className="capitalize">{booking.contactMethod}</span>: 
                        <span className="font-bold">{booking.contactMethod === 'phone' ? 'Звонок' : booking.contactValue || '—'}</span>
                      </div>
                    )}
                    {booking.comment && <p className="text-xs text-gray-500 dark:text-gray-400 italic mt-1 bg-gray-50 dark:bg-slate-800 p-1.5 rounded">«{booking.comment}»</p>}
                  </div>
                </td>

                <td className="p-4">
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{booking.branch === "ANGARSK" ? "Ангарск" : "Иркутск"}</span>
                  <div className="mt-2">{getStatusBadge(booking.status)}</div>
                  <div className="text-[10px] text-gray-400 dark:text-gray-500 mt-1 flex items-center gap-1"><Clock size={10} /> до {new Date(booking.expiresAt).toLocaleString('ru-RU', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' })}</div>
                  
                  {booking.pickupCode && (
                    <div className="mt-2 text-xs bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded flex items-center gap-1 w-max">
                      <ShieldCheck size={12} className="text-green-500" />
                      Код: <span className="font-mono font-bold text-gray-900 dark:text-white text-sm">{booking.pickupCode}</span>
                    </div>
                  )}

                  {booking.status === "CANCELLED" && booking.cancelReason && (
                    <div className="text-[10px] text-red-500 dark:text-red-400 mt-1 max-w-[150px]"><span className="font-bold">Причина:</span> {booking.cancelReason}</div>
                  )}
                </td>

                <td className="p-4 text-right">
                  <div className="flex items-center justify-end gap-2 flex-wrap">
                    {booking.status === "PENDING" && (
                      <>
                        <button onClick={() => updateStatus(booking.id, "CONFIRMED")} disabled={loadingId === booking.id} className="flex items-center gap-1 px-3 py-1.5 bg-green-100 text-green-700 hover:bg-green-200 dark:bg-green-900/30 dark:text-green-400 dark:hover:bg-green-900/50 rounded-lg text-xs font-bold disabled:opacity-50 transition-colors"><CheckCircle size={14} /> Подтвердить</button>
                        <button onClick={() => handleCancel(booking.id)} disabled={loadingId === booking.id} className="flex items-center gap-1 px-3 py-1.5 bg-red-100 text-red-700 hover:bg-red-200 dark:bg-red-900/30 dark:text-red-400 dark:hover:bg-red-900/50 rounded-lg text-xs font-bold disabled:opacity-50 transition-colors"><XCircle size={14} /> Отменить</button>
                      </>
                    )}
                    {booking.status === "CONFIRMED" && (
                       <button onClick={() => updateStatus(booking.id, "READY")} disabled={loadingId === booking.id} className="flex items-center gap-1 px-3 py-1.5 bg-blue-100 text-blue-700 hover:bg-blue-200 dark:bg-blue-900/30 dark:text-blue-400 dark:hover:bg-blue-900/50 rounded-lg text-xs font-bold disabled:opacity-50 transition-colors"><CheckCircle size={14} /> Готово к выдаче</button>
                    )}
                    {booking.status === "READY" && (
                       <button onClick={() => updateStatus(booking.id, "COMPLETED")} disabled={loadingId === booking.id} className="flex items-center gap-1 px-3 py-1.5 bg-green-500 text-white hover:bg-green-600 rounded-lg text-xs font-bold disabled:opacity-50 transition-colors"><CheckCircle size={14} /> Выдано</button>
                    )}
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}