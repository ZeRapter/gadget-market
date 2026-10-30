"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Phone, User, Search, Clock, Loader2, MessageSquare, Filter } from "lucide-react";

export default function CustomRequestsClient({ initialRequests }: { initialRequests: any[] }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  const [loadingId, setLoadingId] = useState<string | null>(null);
  const [filterStatus, setFilterStatus] = useState(searchParams.get("status") || "");

  useEffect(() => {
    setFilterStatus(searchParams.get("status") || "");
  }, [searchParams]);

  const handleFilterChange = (val: string) => {
    setFilterStatus(val);
    const params = new URLSearchParams(searchParams.toString());
    if (val) params.set("status", val); else params.delete("status");
    router.push(`/admin/custom-requests?${params.toString()}`);
  };

  const updateStatus = async (id: string, status: string) => {
    setLoadingId(id);
    try {
      const res = await fetch(`/api/admin/custom-request/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      if (res.ok) router.refresh();
    } catch (error) {
      alert("Ошибка сети");
    } finally {
      setLoadingId(null);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "NEW": return <span className="bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400 px-2 py-1 rounded text-xs font-bold whitespace-nowrap">Новая</span>;
      case "SEARCHING": return <span className="bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 px-2 py-1 rounded text-xs font-bold whitespace-nowrap">В поиске</span>;
      case "FOUND": return <span className="bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 px-2 py-1 rounded text-xs font-bold whitespace-nowrap">Найдено</span>;
      case "REJECTED": return <span className="bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400 px-2 py-1 rounded text-xs font-bold whitespace-nowrap">Отказ</span>;
      default: return null;
    }
  };

  const filtered = initialRequests.filter(r => filterStatus === "" || r.status === filterStatus);

  return (
    <div className="space-y-6">
      <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-gray-200 dark:border-slate-800 flex items-center gap-3">
        <div className="flex items-center gap-1 text-sm text-gray-500 dark:text-gray-400 mr-2">
          <Filter size={16} /> Фильтры:
        </div>
        <select value={filterStatus} onChange={e => handleFilterChange(e.target.value)} className="p-2 text-sm border rounded-lg bg-gray-50 dark:bg-slate-800 dark:border-slate-700 dark:text-white outline-none">
          <option value="">Все заявки</option>
          <option value="NEW">Новые</option>
          <option value="SEARCHING">В поиске</option>
          <option value="FOUND">Найдено</option>
          <option value="REJECTED">Отказ</option>
        </select>
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-gray-200 dark:border-slate-800 overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-gray-50 dark:bg-slate-800/50 border-b text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">
              <th className="p-4">Запрос клиента</th>
              <th className="p-4">Клиент</th>
              <th className="p-4">Статус</th>
              <th className="p-4 text-right">Действия</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 dark:divide-slate-800">
            {filtered.length === 0 ? (
               <tr><td colSpan={4} className="p-8 text-center text-gray-500 dark:text-gray-400">Заявок нет</td></tr>
            ) : filtered.map(req => {
              const clientName = req.guestName || req.user?.name || "Гость";
              const clientPhone = req.guestPhone || req.user?.phone;
              
              return (
                <tr key={req.id} className="hover:bg-gray-50 dark:hover:bg-slate-800/30 transition-colors">
                  <td className="p-4 max-w-md">
                    <p className="font-bold text-sm dark:text-white flex items-center gap-2 mb-1"><Search size={16} className="text-blue-500 shrink-0" /> {req.productName}</p>
                    {req.comment && (
                      <p className="text-xs text-gray-600 dark:text-gray-400 bg-gray-50 dark:bg-slate-800 p-2 rounded-lg mt-1 flex gap-2">
                         <MessageSquare size={14} className="shrink-0 mt-0.5" /> {req.comment}
                      </p>
                    )}
                  </td>
                  <td className="p-4">
                    <div className="flex items-center gap-1.5 text-sm font-bold text-gray-900 dark:text-white">
                      <User size={14} className="text-gray-400 dark:text-gray-500" /> {clientName}
                    </div>
                    {clientPhone && (
                      <a href={`tel:${clientPhone}`} className="flex items-center gap-1 text-xs text-green-600 dark:text-green-400 mt-1 hover:underline">
                        <Phone size={12} /> {clientPhone}
                      </a>
                    )}
                    <div className="text-xs text-blue-500 dark:text-blue-400 mt-1">{req.contactMethod}: {req.contactValue}</div>
                  </td>
                  <td className="p-4">
                    <div className="mb-2">{getStatusBadge(req.status)}</div>
                    <div className="text-[10px] text-gray-400 dark:text-gray-500 flex items-center gap-1">
                      <Clock size={10} /> {new Date(req.createdAt).toLocaleString('ru-RU', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' })}
                    </div>
                  </td>
                  <td className="p-4 text-right">
                    <div className="relative w-full sm:w-auto inline-block">
                      {loadingId === req.id && <div className="absolute inset-0 bg-white/50 dark:bg-slate-900/50 flex items-center justify-center z-10 rounded-lg"><Loader2 className="animate-spin text-blue-500" size={16} /></div>}
                      <select 
                        value={req.status}
                        onChange={(e) => updateStatus(req.id, e.target.value)}
                        disabled={loadingId === req.id}
                        className="w-full p-2 text-xs border rounded-lg bg-gray-50 dark:bg-slate-800 dark:border-slate-700 dark:text-white outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
                      >
                        <option value="NEW">Новая</option>
                        <option value="SEARCHING">В поиске</option>
                        <option value="FOUND">Найдено</option>
                        <option value="REJECTED">Отказ</option>
                      </select>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}