"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Phone, User, Package, Clock, X, Box, HelpCircle, Search, Filter, Loader2 } from "lucide-react";

export default function TradeInAdminClient({ initialRequests }: { initialRequests: any[] }) {
  const router = useRouter();
  const [loadingId, setLoadingId] = useState<string | null>(null);
  const [selectedRequest, setSelectedRequest] = useState<any>(null);
  
  // Стейты для фильтров
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState("");

  const updateStatus = async (id: string, status: string) => {
    setLoadingId(id);
    try {
      const res = await fetch(`/api/admin/trade-in/${id}`, {
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

  // Красивые статусы
  const getStatusBadge = (status: string) => {
    switch (status) {
      case "NEW": return <span className="bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400 px-2 py-1 rounded text-xs font-bold whitespace-nowrap">Новая</span>;
      case "TRANSFERRED": return <span className="bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 px-2 py-1 rounded text-xs font-bold whitespace-nowrap">У менеджера</span>;
      case "IN_PROGRESS": return <span className="bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400 px-2 py-1 rounded text-xs font-bold whitespace-nowrap">В работе</span>;
      case "COMPLETED": return <span className="bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 px-2 py-1 rounded text-xs font-bold whitespace-nowrap">Выполнено</span>;
      default: return <span className="bg-gray-100 text-gray-700 px-2 py-1 rounded text-xs">{status}</span>;
    }
  };

  // ЛОГИКА ФИЛЬТРАЦИИ
  const filteredRequests = initialRequests.filter(req => {
    const clientName = req.guestName || req.user?.name || "Гость";
    const clientPhone = req.guestPhone || req.user?.phone || "";
    
    const query = searchQuery.toLowerCase();
    const matchesSearch = query === "" || 
      clientName.toLowerCase().includes(query) || 
      clientPhone.includes(query) || 
      req.deviceToTrade.toLowerCase().includes(query);

    const matchesStatus = filterStatus === "" || req.status === filterStatus;

    return matchesSearch && matchesStatus;
  });

  return (
    <>
      <div className="space-y-6">
        {/* ПАНЕЛЬ ФИЛЬТРОВ */}
        <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-gray-200 dark:border-slate-800 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div className="flex flex-wrap items-center gap-3 w-full">
            <div className="flex items-center gap-1 text-sm text-gray-500 dark:text-gray-400 mr-2">
              <Filter size={16} /> Фильтры:
            </div>
            
            <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)} className="p-2 text-sm border rounded-lg bg-gray-50 dark:bg-slate-800 dark:border-slate-700 dark:text-white outline-none">
              <option value="">Все статусы</option>
              <option value="NEW">Новые</option>
              <option value="TRANSFERRED">Передано менеджеру</option>
              <option value="IN_PROGRESS">В работе</option>
              <option value="COMPLETED">Выполнено</option>
            </select>

            {(filterStatus || searchQuery) && (
              <button onClick={() => { setSearchQuery(""); setFilterStatus(""); }} className="text-sm text-red-500 hover:text-red-700 dark:text-red-400 ml-auto font-medium">
                Сбросить
              </button>
            )}
          </div>

          <div className="relative w-full md:w-72 shrink-0">
            <Search className="absolute left-3 top-2.5 text-gray-400 dark:text-gray-500" size={18} />
            <input 
              type="text" 
              placeholder="Поиск по клиенту или устройству..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 dark:text-white text-sm"
            />
          </div>
        </div>

        {/* ТАБЛИЦА */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-gray-200 dark:border-slate-800 overflow-hidden">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 dark:bg-slate-800/50 border-b text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">
                <th className="p-4">Устройство</th>
                <th className="p-4">Клиент</th>
                <th className="p-4">Статус</th>
                <th className="p-4 text-right">Действия</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-slate-800">
              {filteredRequests.length === 0 ? (
                <tr><td colSpan={4} className="p-8 text-center text-gray-500 dark:text-gray-400">Ничего не найдено по вашему запросу</td></tr>
              ) : (
                filteredRequests.map((req) => {
                  const clientName = req.guestName || req.user?.name || "Гость";
                  const clientPhone = req.guestPhone || req.user?.phone;

                  return (
                    <tr key={req.id} className="hover:bg-gray-50 dark:hover:bg-slate-800/30 transition-colors">
                      <td className="p-4">
                        <div className="flex items-center gap-2 mb-1">
                          <Package size={16} className="text-blue-500" />
                          <span className="font-bold text-sm dark:text-white">{req.deviceToTrade}</span>
                        </div>
                        <p className="text-xs text-gray-500 dark:text-gray-400">Состояние: {req.condition}</p>
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
                        <div className="flex items-center justify-end gap-3 flex-wrap">
                          <button onClick={() => setSelectedRequest(req)} className="px-3 py-1.5 bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-slate-800 dark:text-gray-300 dark:hover:bg-slate-700 rounded-lg text-xs font-bold transition-colors">
                            Подробнее
                          </button>
                          
                          {/* ВЫПАДАЮЩИЙ СПИСОК СТАТУСОВ */}
                          <div className="relative">
                            {loadingId === req.id && <div className="absolute inset-0 bg-white/50 dark:bg-slate-900/50 flex items-center justify-center z-10"><Loader2 className="animate-spin text-blue-500" size={16} /></div>}
                            <select 
                              value={req.status}
                              onChange={(e) => updateStatus(req.id, e.target.value)}
                              disabled={loadingId === req.id}
                              className="p-2 text-xs border rounded-lg bg-gray-50 dark:bg-slate-800 dark:border-slate-700 dark:text-white outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
                            >
                              <option value="NEW">Новая</option>
                              <option value="TRANSFERRED">Передано менеджеру</option>
                              <option value="IN_PROGRESS">В работе</option>
                              <option value="COMPLETED">Выполнено</option>
                            </select>
                          </div>
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

      {/* МОДАЛКА (без изменений) */}
      {selectedRequest && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white dark:bg-slate-900 w-full max-w-lg rounded-3xl shadow-2xl overflow-hidden relative">
            <button onClick={() => setSelectedRequest(null)} className="absolute top-4 right-4 p-2 text-gray-400 hover:text-red-500 transition-colors">
              <X size={20} />
            </button>
            
            <div className="p-8">
              <h2 className="text-2xl font-bold dark:text-white mb-6">Детали заявки Trade-in</h2>
              
              <div className="space-y-4">
                <div className="bg-gray-50 dark:bg-slate-800 p-4 rounded-xl">
                  <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Устройство:</p>
                  <p className="font-bold dark:text-white flex items-center gap-2">
                    <Package size={18} className="text-blue-500" /> {selectedRequest.deviceToTrade}
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-gray-50 dark:bg-slate-800 p-4 rounded-xl">
                    <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Состояние:</p>
                    <p className="font-medium text-sm dark:text-white">{selectedRequest.condition}</p>
                  </div>
                  <div className="bg-gray-50 dark:bg-slate-800 p-4 rounded-xl">
                    <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Комплектность:</p>
                    <p className="font-medium text-sm dark:text-white flex items-start gap-1">
                      <Box size={14} className="text-gray-400 dark:text-gray-500 shrink-0 mt-0.5" /> 
                      {selectedRequest.completeness || "Не указано"}
                    </p>
                  </div>
                </div>

                {selectedRequest.desiredDevice && (
                  <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-xl border border-green-200 dark:border-green-900/50">
                    <p className="text-xs text-green-600 dark:text-green-400 mb-1">Хочет получить взамен:</p>
                    <p className="font-bold text-sm text-green-700 dark:text-green-300 flex items-center gap-2">
                      <HelpCircle size={16} /> {selectedRequest.desiredDevice}
                    </p>
                  </div>
                )}

                <div className="border-t border-gray-200 dark:border-slate-700 pt-4">
                  <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">Контактная информация:</p>
                  <p className="font-bold dark:text-white">{selectedRequest.guestName || selectedRequest.user?.name || "Гость"}</p>
                  <p className="text-sm text-green-600 dark:text-green-400 font-semibold">{selectedRequest.guestPhone || selectedRequest.user?.phone || "Нет телефона"}</p>
                  <p className="text-sm text-blue-500 dark:text-blue-400 mt-1">Связь через: {selectedRequest.contactMethod} ({selectedRequest.contactValue})</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}