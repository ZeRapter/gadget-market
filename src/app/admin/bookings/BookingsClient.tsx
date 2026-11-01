"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { CheckCircle, XCircle, Clock, Phone, User, Package, Send, MessageCircle, ShieldCheck, Search, Filter, Loader2 } from "lucide-react";

export default function BookingsClient({ initialBookings }: { initialBookings: any[] }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [loadingId, setLoadingId] = useState<string | null>(null);
  
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState(searchParams.get("status") || "");
  const [filterBranch, setFilterBranch] = useState("");

  useEffect(() => {
    setFilterStatus(searchParams.get("status") || "");
  }, [searchParams]);

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
      case "PENDING": return <span className="bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400 px-2 py-1 rounded text-xs font-bold whitespace-nowrap">Ожидает</span>;
      case "CONFIRMED": return <span className="bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 px-2 py-1 rounded text-xs font-bold whitespace-nowrap">Принято</span>;
      case "READY": return <span className="bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 px-2 py-1 rounded text-xs font-bold whitespace-nowrap">Ожидает выдачи</span>;
      case "COMPLETED": return <span className="bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 px-2 py-1 rounded text-xs font-bold whitespace-nowrap">Выдано</span>;
      case "CANCELLED": return <span className="bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400 px-2 py-1 rounded text-xs font-bold whitespace-nowrap">Отменено</span>;
      default: return null;
    }
  };

  const filteredBookings = initialBookings.filter(booking => {
    const clientName = booking.user ? booking.user.name : booking.guestName || "Гость";
    const clientPhone = booking.guestPhone || booking.user?.phone || "";
    const productNames = booking.items.map((i: any) => i.product.name).join(" ");
    
    const query = searchQuery.toLowerCase();
    const matchesSearch = query === "" || 
      clientName.toLowerCase().includes(query) || 
      clientPhone.includes(query) || 
      productNames.toLowerCase().includes(query) ||
      (booking.bookingNumber && booking.bookingNumber.toString().includes(query));

    const matchesStatus = filterStatus === "" || booking.status === filterStatus;
    const matchesBranch = filterBranch === "" || booking.branch === filterBranch;

    return matchesSearch && matchesStatus && matchesBranch;
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
            <option value="CONFIRMED">Принято</option>
            <option value="READY">Ожидает выдачи</option>
            <option value="COMPLETED">Выдано</option>
            <option value="CANCELLED">Отменено</option>
          </select>

          <select value={filterBranch} onChange={e => setFilterBranch(e.target.value)} className="p-2 text-sm border rounded-lg bg-gray-50 dark:bg-slate-800 dark:border-slate-700 dark:text-white outline-none">
            <option value="">Все филиалы</option>
            <option value="ANGARSK">Ангарск</option>
            <option value="IRKUTSK">Иркутск</option>
          </select>

          {(filterStatus || filterBranch || searchQuery) && (
            <button onClick={() => { setSearchQuery(""); setFilterStatus(""); setFilterBranch(""); }} className="text-sm text-red-500 hover:text-red-700 dark:text-red-400 ml-auto font-medium">
              Сбросить
            </button>
          )}
        </div>

        <div className="relative w-full md:w-72 shrink-0">
          <Search className="absolute left-3 top-2.5 text-gray-400 dark:text-gray-500" size={18} />
          <input 
            type="text" 
            placeholder="Поиск по номеру, клиенту или товару..." 
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
              <th className="p-4 w-16">№</th>
              <th className="p-4 w-1/3">Товары в брони</th>
              <th className="p-4">Клиент и связь</th>
              <th className="p-4">Филиал / Статус</th>
              <th className="p-4 text-right">Действия</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 dark:divide-slate-800">
            {filteredBookings.length === 0 ? (
              <tr><td colSpan={5} className="p-8 text-center text-gray-500 dark:text-gray-400">Ничего не найдено</td></tr>
            ) : (
              filteredBookings.map((booking) => {
                const clientPhone = booking.guestPhone || booking.user?.phone;
                const clientName = booking.user ? booking.user.name : booking.guestName || "Гость";

                return (
                  <tr key={booking.id} className="hover:bg-gray-50 dark:hover:bg-slate-800/30 transition-colors">
                    <td className="p-4 align-top">
                      <span className="font-mono font-bold text-blue-500 text-sm">
                        {booking.bookingNumber ? `№${booking.bookingNumber}` : "—"}
                      </span>
                    </td>
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
                      <div className="flex flex-col gap-2 items-end">
                        <div className="relative w-full sm:w-auto">
                          {loadingId === booking.id && <div className="absolute inset-0 bg-white/50 dark:bg-slate-900/50 flex items-center justify-center z-10 rounded-lg"><Loader2 className="animate-spin text-blue-500" size={16} /></div>}
                          <select 
                            value={booking.status}
                            onChange={(e) => updateStatus(booking.id, e.target.value)}
                            disabled={loadingId === booking.id}
                            className="w-full p-2 text-xs border rounded-lg bg-gray-50 dark:bg-slate-800 dark:border-slate-700 dark:text-white outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
                          >
                            <option value="PENDING">Ожидает</option>
                            <option value="CONFIRMED">Принято</option>
                            <option value="READY">Ожидает выдачи</option>
                            <option value="COMPLETED">Выдано</option>
                          </select>
                        </div>

                        {booking.status !== "CANCELLED" && booking.status !== "COMPLETED" && (
                          <button onClick={() => handleCancel(booking.id)} disabled={loadingId === booking.id} className="w-full sm:w-auto px-3 py-1.5 bg-red-100 text-red-700 hover:bg-red-200 dark:bg-red-900/30 dark:text-red-400 dark:hover:bg-red-900/50 rounded-lg text-xs font-bold transition-colors">Отменить</button>
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