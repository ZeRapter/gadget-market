"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { CheckCircle, XCircle, Clock, Phone, User, Package, Truck, ShieldCheck, Search, Filter, Loader2 } from "lucide-react";

export default function OrdersClient({ initialOrders }: { initialOrders: any[] }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [loadingId, setLoadingId] = useState<string | null>(null);
  
  const [searchQuery, setSearchQuery] = useState("");
  // Инициализируем фильтр статуса из URL (если перешли с дашборда)
  const [filterStatus, setFilterStatus] = useState(searchParams.get("status") || "");
  const [filterDelivery, setFilterDelivery] = useState("");

  // Синхронизация фильтра с URL при изменении URL
  useEffect(() => {
    setFilterStatus(searchParams.get("status") || "");
  }, [searchParams]);

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
      case "PENDING": return <span className="bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400 px-2 py-1 rounded text-xs font-bold whitespace-nowrap">Ожидает</span>;
      case "PROCESSING": return <span className="bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 px-2 py-1 rounded text-xs font-bold whitespace-nowrap">Принято</span>;
      case "SHIPPED": return <span className="bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400 px-2 py-1 rounded text-xs font-bold whitespace-nowrap">Ожидает прибытия</span>;
      case "COMPLETED": return <span className="bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 px-2 py-1 rounded text-xs font-bold whitespace-nowrap">Выдано</span>;
      case "CANCELLED": return <span className="bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400 px-2 py-1 rounded text-xs font-bold whitespace-nowrap">Отменено</span>;
      default: return null;
    }
  };

  const filteredOrders = initialOrders.filter(order => {
    const clientName = order.user ? order.user.name : order.guestName || "Гость";
    const clientPhone = order.guestPhone || order.user?.phone || "";
    const productNames = order.items.map((i: any) => i.product.name).join(" ");
    
    const query = searchQuery.toLowerCase();
    const matchesSearch = query === "" || 
      clientName.toLowerCase().includes(query) || 
      clientPhone.includes(query) || 
      productNames.toLowerCase().includes(query);

    const matchesStatus = filterStatus === "" || order.status === filterStatus;
    const matchesDelivery = filterDelivery === "" || order.deliveryService === filterDelivery;

    return matchesSearch && matchesStatus && matchesDelivery;
  });

  return (
    <div className="space-y-6">
      <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-gray-200 dark:border-slate-800 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="flex flex-wrap items-center gap-3 w-full">
          <div className="flex items-center gap-1 text-sm text-gray-500 dark:text-gray-400 mr-2">
            <Filter size={16} /> Фильтры:
          </div>
          
          <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)} className="p-2 text-sm border rounded-lg bg-gray-50 dark:bg-slate-800 dark:border-slate-700 dark:text-white outline-none">
            <option value="">Все статусы</option>
            <option value="PENDING">Ожидает</option>
            <option value="PROCESSING">Принято</option>
            <option value="SHIPPED">Ожидает прибытия</option>
            <option value="COMPLETED">Выдано</option>
            <option value="CANCELLED">Отменено</option>
          </select>

          <select value={filterDelivery} onChange={e => setFilterDelivery(e.target.value)} className="p-2 text-sm border rounded-lg bg-gray-50 dark:bg-slate-800 dark:border-slate-700 dark:text-white outline-none">
            <option value="">Все доставки</option>
            <option value="СДЭК">СДЭК</option>
            <option value="Почта России">Почта России</option>
            <option value="Boxberry">Boxberry</option>
            <option value="5Post">5Post</option>
          </select>

          {(filterStatus || filterDelivery || searchQuery) && (
            <button onClick={() => { setSearchQuery(""); setFilterStatus(""); setFilterDelivery(""); }} className="text-sm text-red-500 hover:text-red-700 dark:text-red-400 ml-auto font-medium">
              Сбросить
            </button>
          )}
        </div>

        <div className="relative w-full md:w-72 shrink-0">
          <Search className="absolute left-3 top-2.5 text-gray-400 dark:text-gray-500" size={18} />
          <input 
            type="text" 
            placeholder="Поиск по клиенту или товару..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 dark:text-white text-sm"
          />
        </div>
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-gray-200 dark:border-slate-800 overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-gray-50 dark:bg-slate-800/50 border-b border-gray-200 dark:border-slate-800 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
              <th className="p-4 w-1/4">Товары</th>
              <th className="p-4">Клиент и Доставка</th>
              <th className="p-4">Статус</th>
              <th className="p-4 text-right">Действия</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 dark:divide-slate-800">
            {filteredOrders.length === 0 ? (
              <tr><td colSpan={4} className="p-8 text-center text-gray-500 dark:text-gray-400">Ничего не найдено</td></tr>
            ) : (
              filteredOrders.map((order) => {
                const clientPhone = order.guestPhone || order.user?.phone;
                const clientName = order.user ? order.user.name : order.guestName || "Гость";

                return (
                  <tr key={order.id} className="hover:bg-gray-50 dark:hover:bg-slate-800/30 transition-colors">
                    <td className="p-4">
                      <div className="flex flex-col gap-2">
                        {order.items.map((item: any) => (
                          <div key={item.id} className="flex items-center gap-2">
                            <div className="w-8 h-8 bg-gray-100 dark:bg-slate-800 rounded shrink-0 flex items-center justify-center"><Package size={14} className="text-gray-500 dark:text-gray-400" /></div>
                            <div>
                              <p className="font-bold text-xs text-gray-900 dark:text-white line-clamp-1">{item.product.name}</p>
                              <p className="text-[10px] text-gray-500 dark:text-gray-400">{item.quantity} шт. × {(item.price / 100).toLocaleString('ru-RU')} ₽</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </td>

                    <td className="p-4">
                      <div className="flex flex-col gap-1.5">
                        <div className="flex items-center gap-1.5 text-sm font-bold text-gray-900 dark:text-white">
                          <User size={14} className="text-gray-400 dark:text-gray-500" /> {clientName}
                          {order.user && <span className="text-[10px] bg-slate-100 dark:bg-slate-800 text-gray-500 dark:text-gray-400 px-1.5 py-0.5 rounded">Зарег.</span>}
                        </div>
                        {clientPhone && (
                          <a href={`tel:${clientPhone}`} className="flex items-center gap-1.5 text-sm font-semibold text-green-600 dark:text-green-400 hover:underline">
                            <Phone size={14} /> {clientPhone}
                          </a>
                        )}
                        {order.contactMethod && (
                          <div className="flex items-center gap-1.5 text-xs text-blue-500 dark:text-blue-400 font-medium bg-blue-50 dark:bg-blue-900/20 px-2 py-1 rounded-md w-max">
                            <span className="capitalize">{order.contactMethod}</span>: <span className="font-bold">{order.contactMethod === 'phone' ? 'Звонок' : order.contactValue || '—'}</span>
                          </div>
                        )}
                        <div className="mt-2 text-xs bg-gray-100 dark:bg-slate-800 p-2 rounded-lg">
                          <p className="flex items-center gap-1 font-bold text-gray-700 dark:text-gray-300"><Truck size={12}/> {order.deliveryService}</p>
                          <p className="text-gray-500 dark:text-gray-400 mt-1 line-clamp-2">{order.address || "Адрес не указан"}</p>
                        </div>
                        {order.comment && <p className="text-xs text-gray-500 dark:text-gray-400 italic mt-1">«{order.comment}»</p>}
                      </div>
                    </td>

                    <td className="p-4">
                      <div className="mb-2">{getStatusBadge(order.status)}</div>
                      <div className="text-[10px] text-gray-400 dark:text-gray-500 flex items-center gap-1">
                        <Clock size={10} /> {new Date(order.createdAt).toLocaleString('ru-RU', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' })}
                      </div>
                      
                      {order.pickupCode && (
                        <div className="mt-2 text-xs bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded flex items-center gap-1 w-max">
                          <ShieldCheck size={12} className="text-green-500" />
                          Код: <span className="font-mono font-bold text-gray-900 dark:text-white text-sm">{order.pickupCode}</span>
                        </div>
                      )}

                      {order.status === "CANCELLED" && order.cancelReason && (
                        <div className="text-[10px] text-red-500 dark:text-red-400 mt-2 max-w-[150px]">
                          <span className="font-bold">Причина:</span> {order.cancelReason}
                        </div>
                      )}
                    </td>

                    <td className="p-4 text-right">
                      <div className="flex flex-col gap-2 items-end">
                        <div className="relative w-full sm:w-auto">
                          {loadingId === order.id && <div className="absolute inset-0 bg-white/50 dark:bg-slate-900/50 flex items-center justify-center z-10 rounded-lg"><Loader2 className="animate-spin text-blue-500" size={16} /></div>}
                          <select 
                            value={order.status}
                            onChange={(e) => updateStatus(order.id, e.target.value)}
                            disabled={loadingId === order.id}
                            className="w-full p-2 text-xs border rounded-lg bg-gray-50 dark:bg-slate-800 dark:border-slate-700 dark:text-white outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
                          >
                            <option value="PENDING">Ожидает</option>
                            <option value="PROCESSING">Принято</option>
                            <option value="SHIPPED">Ожидает прибытия</option>
                            <option value="COMPLETED">Выдано</option>
                          </select>
                        </div>

                        {order.status !== "CANCELLED" && order.status !== "COMPLETED" && (
                           <button onClick={() => handleCancel(order.id)} disabled={loadingId === order.id} className="w-full sm:w-auto px-3 py-1.5 bg-red-100 text-red-700 hover:bg-red-200 dark:bg-red-900/30 dark:text-red-400 dark:hover:bg-red-900/50 rounded-lg text-xs font-bold transition-colors">Отменить</button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}