"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Phone, User, Package, Clock, X, Box, HelpCircle } from "lucide-react";

export default function TradeInAdminClient({ initialRequests }: { initialRequests: any[] }) {
  const router = useRouter();
  const [loadingId, setLoadingId] = useState<string | null>(null);
  const [selectedRequest, setSelectedRequest] = useState<any>(null);

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

  if (initialRequests.length === 0) return <div className="bg-white dark:bg-slate-900 rounded-2xl border p-12 text-center text-gray-500 dark:text-gray-400">Заявок пока нет.</div>;

  return (
    <>
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
            {initialRequests.map((req) => {
              const clientName = req.guestName || req.user?.name || "Гость";
              const clientPhone = req.guestPhone || req.user?.phone;

              return (
                <tr key={req.id} className="hover:bg-gray-50 dark:hover:bg-slate-800/30">
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
                    <span className={`text-xs font-bold px-2 py-1 rounded ${
                      req.status === 'NEW' ? 'bg-yellow-100 text-yellow-700' : 'bg-green-100 text-green-700'
                    }`}>
                      {req.status === 'NEW' ? 'Новая' : 'Обработана'}
                    </span>
                    <div className="text-[10px] text-gray-400 dark:text-gray-500 mt-1 flex items-center gap-1">
                      <Clock size={10} /> {new Date(req.createdAt).toLocaleString('ru-RU', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' })}
                    </div>
                  </td>
                  <td className="p-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button onClick={() => setSelectedRequest(req)} className="px-3 py-1.5 bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-slate-800 dark:text-gray-300 dark:hover:bg-slate-700 rounded-lg text-xs font-bold transition-colors">
                        Подробнее
                      </button>
                      {req.status === 'NEW' && (
                        <button onClick={() => updateStatus(req.id, "PROCESSED")} disabled={loadingId === req.id} className="px-3 py-1.5 bg-green-100 text-green-700 hover:bg-green-200 dark:bg-green-900/30 dark:text-green-400 dark:hover:bg-green-900/50 rounded-lg text-xs font-bold transition-colors">
                          Обработано
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

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