"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { CheckCircle, XCircle, Clock, Phone, User, Package, Truck } from "lucide-react";

export default function OrdersClient({ initialOrders }: { initialOrders: any[] }) {
  const router = useRouter();
  const [loadingId, setLoadingId] = useState<string | null>(null);

  const updateStatus = async (id: string, status: string, reason?: string) => {
    setLoadingId(id);
    try {
      const res = await fetch(`/api/admin/orders/${id}`, {
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
    const reason = window.prompt("Укажите причину отмены заказа (клиент увидит этот текст):");
    if (reason !== null && reason.trim() !== "") {
      updateStatus(id, "CANCELLED", reason);
    } else if (reason !== null) {
      alert("Причина отмены обязательна!");
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "PENDING": return <span className="bg-yellow-100 text-yellow-700 px-2 py-1 rounded text-xs font-bold">Ожидает</span>;
      case "PROCESSING": return <span className="bg-blue-100 text-blue-700 px-2 py-1 rounded text-xs font-bold">В обработке</span>;
      case "SHIPPED": return <span className="bg-purple-100 text-purple-700 px-2 py-1 rounded text-xs font-bold">Отправлен</span>;
      case "COMPLETED": return <span className="bg-green-100 text-green-700 px-2 py-1 rounded text-xs font-bold">Завершен</span>;
      case "CANCELLED": return <span className="bg-red-100 text-red-700 px-2 py-1 rounded text-xs font-bold">Отменено</span>;
      default: return null;
    }
  };

  if (initialOrders.length === 0) return <div className="bg-white dark:bg-slate-900 rounded-2xl border p-12 text-center text-gray-500">Заказов пока нет.</div>;

  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-gray-200 dark:border-slate-800 overflow-hidden">
      <table className="w-full text-left border-collapse">
        <thead>
          <tr className="bg-gray-50 dark:bg-slate-800/50 border-b text-xs font-semibold text-gray-500 uppercase tracking-wider">
            <th className="p-4 w-1/4">Товары</th>
            <th className="p-4">Клиент и Доставка</th>
            <th className="p-4">Статус</th>
            <th className="p-4 text-right">Действия</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100 dark:divide-slate-800">
          {initialOrders.map((order) => {
            const clientPhone = order.guestPhone || order.user?.phone;
            const clientName = order.user ? order.user.name : order.guestName || "Гость";

            return (
              <tr key={order.id} className="hover:bg-gray-50 dark:hover:bg-slate-800/30 transition-colors">
                <td className="p-4">
                  <div className="flex flex-col gap-2">
                    {order.items.map((item: any) => (
                      <div key={item.id} className="flex items-center gap-2">
                        <div className="w-8 h-8 bg-gray-100 dark:bg-slate-800 rounded shrink-0 flex items-center justify-center"><Package size={14} className="text-gray-500" /></div>
                        <div>
                          <p className="font-bold text-xs text-gray-900 dark:text-white line-clamp-1">{item.product.name}</p>
                          <p className="text-[10px] text-gray-500">{item.quantity} шт. × {(item.price / 100).toLocaleString('ru-RU')} ₽</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </td>

                <td className="p-4">
                  <div className="flex flex-col gap-1.5">
                    <div className="flex items-center gap-1.5 text-sm font-bold text-gray-900 dark:text-white">
                      <User size={14} className="text-gray-400" /> {clientName}
                      {order.user && <span className="text-[10px] bg-slate-100 dark:bg-slate-800 text-gray-500 px-1.5 py-0.5 rounded">Зарег.</span>}
                    </div>
                    {clientPhone && (
                      <a href={`tel:${clientPhone}`} className="flex items-center gap-1.5 text-sm font-semibold text-green-600 dark:text-green-400 hover:underline">
                        <Phone size={14} /> {clientPhone}
                      </a>
                    )}
                    {order.contactMethod && (
                      <div className="flex items-center gap-1.5 text-xs text-blue-500 font-medium bg-blue-50 dark:bg-blue-900/20 px-2 py-1 rounded-md w-max">
                        <span className="capitalize">{order.contactMethod}</span>: <span className="font-bold">{order.contactMethod === 'phone' ? 'Звонок' : order.contactValue || '—'}</span>
                      </div>
                    )}
                    <div className="mt-2 text-xs bg-gray-100 dark:bg-slate-800 p-2 rounded-lg">
                      <p className="flex items-center gap-1 font-bold text-gray-700 dark:text-gray-300"><Truck size={12}/> {order.deliveryService}</p>
                      <p className="text-gray-500 mt-1 line-clamp-2">{order.address || "Адрес не указан"}</p>
                    </div>
                    {order.comment && <p className="text-xs text-gray-500 italic mt-1">«{order.comment}»</p>}
                  </div>
                </td>

                <td className="p-4">
                  {getStatusBadge(order.status)}
                  <div className="text-[10px] text-gray-400 mt-1 flex items-center gap-1">
                    <Clock size={10} /> {new Date(order.createdAt).toLocaleString('ru-RU', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' })}
                  </div>
                  {order.status === "CANCELLED" && order.cancelReason && (
                    <div className="text-[10px] text-red-500 mt-2 max-w-[150px]">
                      <span className="font-bold">Причина:</span> {order.cancelReason}
                    </div>
                  )}
                </td>

                <td className="p-4 text-right">
                  <div className="flex flex-col gap-2 items-end">
                    {order.status === "PENDING" && (
                      <>
                        <button onClick={() => updateStatus(order.id, "PROCESSING")} disabled={loadingId === order.id} className="w-full sm:w-auto px-3 py-1.5 bg-blue-100 text-blue-700 hover:bg-blue-200 rounded-lg text-xs font-bold transition-colors">В обработку</button>
                        <button onClick={() => handleCancel(order.id)} disabled={loadingId === order.id} className="w-full sm:w-auto px-3 py-1.5 bg-red-100 text-red-700 hover:bg-red-200 rounded-lg text-xs font-bold transition-colors">Отменить</button>
                      </>
                    )}
                    {order.status === "PROCESSING" && (
                       <button onClick={() => updateStatus(order.id, "SHIPPED")} disabled={loadingId === order.id} className="w-full sm:w-auto px-3 py-1.5 bg-purple-100 text-purple-700 hover:bg-purple-200 rounded-lg text-xs font-bold transition-colors">Отправлен</button>
                    )}
                    {order.status === "SHIPPED" && (
                       <button onClick={() => updateStatus(order.id, "COMPLETED")} disabled={loadingId === order.id} className="w-full sm:w-auto px-3 py-1.5 bg-green-100 text-green-700 hover:bg-green-200 rounded-lg text-xs font-bold transition-colors">Завершить</button>
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