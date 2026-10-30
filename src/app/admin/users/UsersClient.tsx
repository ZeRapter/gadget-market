"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { UserCircle, Shield, ShieldAlert, User, Loader2, Mail, Phone } from "lucide-react";

export default function UsersClient({ initialUsers }: { initialUsers: any[] }) {
  const router = useRouter();
  const [loadingId, setLoadingId] = useState<string | null>(null);

  const updateUser = async (id: string, role: string, status: string) => {
    setLoadingId(id);
    try {
      const res = await fetch(`/api/admin/users/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ role, status }),
      });
      if (res.ok) {
        router.refresh();
      } else {
        const data = await res.json();
        alert(data.error || "Ошибка при обновлении");
      }
    } catch (error) {
      alert("Ошибка сети");
    } finally {
      setLoadingId(null);
    }
  };

  const getRoleBadge = (role: string) => {
    switch (role) {
      case "ADMIN": return <span className="flex items-center gap-1 text-purple-600 dark:text-purple-400 font-bold text-sm"><ShieldAlert size={14} /> Админ</span>;
      case "SELLER": return <span className="flex items-center gap-1 text-blue-600 dark:text-blue-400 font-bold text-sm"><Shield size={14} /> Продавец</span>;
      default: return <span className="flex items-center gap-1 text-gray-500 dark:text-gray-400 font-medium text-sm"><User size={14} /> Клиент</span>;
    }
  };

  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-gray-200 dark:border-slate-800 overflow-hidden">
      <table className="w-full text-left border-collapse">
        <thead>
          <tr className="bg-gray-50 dark:bg-slate-800/50 border-b text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">
            <th className="p-4">Пользователь</th>
            <th className="p-4">Контакты</th>
            <th className="p-4">Текущая роль</th>
            <th className="p-4">Статус</th>
            <th className="p-4 text-right">Действия</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100 dark:divide-slate-800">
          {initialUsers.map((user) => (
            <tr key={user.id} className="hover:bg-gray-50 dark:hover:bg-slate-800/30 transition-colors">
              
              {/* Информация о пользователе */}
              <td className="p-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-full flex items-center justify-center shrink-0">
                    <UserCircle size={20} />
                  </div>
                  <div>
                    <p className="font-bold text-sm text-gray-900 dark:text-white">{user.name || "Без имени"}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      Регистрация: {new Date(user.createdAt).toLocaleDateString('ru-RU')}
                    </p>
                  </div>
                </div>
              </td>

              {/* Контакты */}
              <td className="p-4">
                <div className="flex flex-col gap-1">
                  {user.email && (
                    <span className="flex items-center gap-1.5 text-xs text-gray-600 dark:text-gray-300">
                      <Mail size={12} className="text-gray-400" /> {user.email}
                    </span>
                  )}
                  {user.phone && (
                    <span className="flex items-center gap-1.5 text-xs text-gray-600 dark:text-gray-300">
                      <Phone size={12} className="text-gray-400" /> {user.phone}
                    </span>
                  )}
                  {!user.email && !user.phone && <span className="text-xs text-gray-400 italic">Нет данных</span>}
                </div>
              </td>

              {/* Текущая роль (визуально) */}
              <td className="p-4">
                {getRoleBadge(user.role)}
              </td>

              {/* Статус (визуально) */}
              <td className="p-4">
                <span className={`px-2 py-1 rounded text-xs font-bold ${
                  user.status === "ACTIVE" 
                    ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' 
                    : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                }`}>
                  {user.status === "ACTIVE" ? "Активен" : "Уволен"}
                </span>
              </td>

              {/* Управление (Выпадающие списки) */}
              <td className="p-4 text-right">
                <div className="relative flex items-center justify-end gap-2">
                  {loadingId === user.id && <Loader2 className="animate-spin text-blue-500 absolute right-[100%] mr-2" size={16} />}
                  
                  {/* Выбор роли */}
                  <select 
                    value={user.role}
                    onChange={(e) => updateUser(user.id, e.target.value, user.status)}
                    disabled={loadingId === user.id}
                    className="p-2 text-xs border rounded-lg bg-gray-50 dark:bg-slate-800 dark:border-slate-700 dark:text-white outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
                  >
                    <option value="CLIENT">Клиент</option>
                    <option value="SELLER">Продавец</option>
                    <option value="ADMIN">Администратор</option>
                  </select>

                  {/* Выбор статуса */}
                  <select 
                    value={user.status}
                    onChange={(e) => updateUser(user.id, user.role, e.target.value)}
                    disabled={loadingId === user.id}
                    className={`p-2 text-xs border rounded-lg outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer bg-gray-50 dark:bg-slate-800 dark:border-slate-700 ${user.status === "ACTIVE" ? "text-green-600 dark:text-green-400 font-bold" : "text-red-600 dark:text-red-400 font-bold"}`}
                  >
                    <option value="ACTIVE">Активен</option>
                    <option value="FIRED">Уволен</option>
                  </select>
                </div>
              </td>
            </tr>
          ))}
          
          {initialUsers.length === 0 && (
            <tr>
              <td colSpan={5} className="p-8 text-center text-gray-500 dark:text-gray-400">
                Пользователей пока нет.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}