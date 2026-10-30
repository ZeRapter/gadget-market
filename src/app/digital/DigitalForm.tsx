"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { CheckCircle2, User, Phone, Gamepad2, Globe, ChevronDown, ChevronUp, Tag } from "lucide-react";

export default function DigitalForm({ plans }: { plans: any[] }) {
  const { data: session } = useSession();
  const userPhone = (session?.user as any)?.phone;
  const userName = session?.user?.name;

  const [gameTitle, setGameTitle] = useState("");
  const [consoleType, setConsoleType] = useState("PlayStation");
  const [region, setRegion] = useState("Турция");
  const [accountStatus, setAccountStatus] = useState("");
  
  const [isEmptyAccount, setIsEmptyAccount] = useState(false);

  const [contactMethod, setContactMethod] = useState("telegram");
  const [contactValue, setContactValue] = useState("");
  
  const [guestName, setGuestName] = useState("");
  const [guestPhone, setGuestPhone] = useState("");

  // НОВЫЙ СТЕЙТ ДЛЯ ГАЛОЧКИ
  const [agreeToData, setAgreeToData] = useState(false);

  const [openPS, setOpenPS] = useState(false); 
  const [openXbox, setOpenXbox] = useState(false);

  useEffect(() => {
    if (userName) setGuestName(userName);
    if (userPhone) setGuestPhone(userPhone);
  }, [userName, userPhone]);

  const handleEmptyAccountToggle = (e: React.ChangeEvent<HTMLInputElement>) => {
    setIsEmptyAccount(e.target.checked);
    if (e.target.checked) {
      setGameTitle("");
      setAccountStatus("Новый");
    }
  };

  const handlePlanClick = (plan: any) => {
    setConsoleType(plan.platform);
    setIsEmptyAccount(false);
    
    if (plan.platform === "Xbox") {
      setGameTitle(`Game Pass Ultimate (${plan.duration})`);
      setAccountStatus(plan.accountType);
      setRegion("Турция");
    } else {
      setGameTitle(`Подписка ${plan.tier} (${plan.duration})`);
      setRegion(plan.region);
      setAccountStatus("");
    }

    const formElement = document.getElementById("digital-form");
    if (formElement) formElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!agreeToData) return; // Дополнительная защита
    
    setError("");

    if (!contactValue.trim()) {
      setError("Пожалуйста, укажите контакт для связи");
      return;
    }
    
    if (!isEmptyAccount && !gameTitle.trim()) {
      setError("Укажите название игры или отметьте пункт 'Создать пустой аккаунт'");
      return;
    }
    if (!isEmptyAccount && !accountStatus) {
      setError("Выберите тип аккаунта (Новый или Действующий)");
      return;
    }

    setLoading(true);

    const finalGameTitle = isEmptyAccount ? "Создание пустого аккаунта" : gameTitle;
    const finalAccountStatus = isEmptyAccount ? "Новый" : accountStatus;

    try {
      const res = await fetch("/api/digital", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          gameTitle: finalGameTitle,
          console: consoleType,
          region: consoleType === "Xbox" ? "Турция" : region,
          accountStatus: finalAccountStatus,
          contactMethod,
          contactValue,
          guestName,
          guestPhone,
        }),
      });

      const data = await res.json();

      if (res.ok) {
        setSuccess(true);
      } else {
        setError(data.error || "Ошибка при отправке заявки");
      }
    } catch (err) {
      setError("Ошибка сети");
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="glass-panel p-12 text-center rounded-3xl">
        <CheckCircle2 size={64} className="text-green-500 mx-auto mb-4" />
        <h2 className="text-2xl font-bold dark:text-white mb-2">Заявка отправлена!</h2>
        <p className="text-gray-500 dark:text-gray-400">
          Мы получили вашу заявку. Менеджер свяжется с вами в ближайшее время.
        </p>
      </div>
    );
  }

  const psPlans = plans.filter(p => p.platform === "PlayStation");
  const xboxPlans = plans.filter(p => p.platform === "Xbox");

  const psTiers = Array.from(new Set(psPlans.map(p => p.tier)));
  const psDurations = ["1 месяц", "3 месяца", "12 месяцев"]; 

  const xboxDurations = Array.from(new Set(xboxPlans.map(p => p.duration))).sort((a, b) => {
    return parseInt(a) - parseInt(b);
  });

  const getPsPrice = (tier: string, regionName: string, duration: string) => {
    return psPlans.find(p => 
      p.tier.trim().toLowerCase() === tier.trim().toLowerCase() && 
      (p.region || "").trim().toLowerCase() === regionName.trim().toLowerCase() && 
      p.duration.trim().toLowerCase() === duration.trim().toLowerCase()
    )?.price || null;
  };

  const getXboxPrice = (accountType: string, duration: string) => {
    return xboxPlans.find(p => 
      (p.accountType || "").trim().toLowerCase() === accountType.trim().toLowerCase() && 
      p.duration.trim().toLowerCase() === duration.trim().toLowerCase()
    )?.price || null;
  };

  return (
    <div className="space-y-8">
      <div className="space-y-4">
        
        {/* PlayStation */}
        <div className="glass-panel rounded-2xl overflow-hidden">
          <button onClick={() => setOpenPS(!openPS)} className="w-full flex items-center justify-between p-4 bg-blue-500/10 hover:bg-blue-500/20 transition-colors">
            <h3 className="text-lg font-bold text-blue-600 dark:text-blue-400 flex items-center gap-2">
              <Gamepad2 size={20} /> Подписки PlayStation
            </h3>
            {openPS ? <ChevronUp size={20} className="text-blue-500" /> : <ChevronDown size={20} className="text-blue-500" />}
          </button>
          
          {openPS && (
            <div className="p-4 overflow-x-auto">
              <table className="w-full text-sm text-center">
                <thead>
                  <tr className="bg-gray-100 dark:bg-slate-800 text-gray-700 dark:text-gray-300">
                    <th className="p-2 border dark:border-slate-700">Подписка</th>
                    <th className="p-2 border dark:border-slate-700">Срок</th>
                    <th className="p-2 border dark:border-slate-700">Турция</th>
                    <th className="p-2 border dark:border-slate-700">Украина</th>
                  </tr>
                </thead>
                <tbody>
                  {psTiers.map(tier => (
                    psDurations.map((duration, idx) => {
                      const turPrice = getPsPrice(tier, "Турция", duration);
                      const ukrPrice = getPsPrice(tier, "Украина", duration);
                      
                      return (
                        <tr key={`${tier}-${duration}`} className="border-b dark:border-slate-700">
                          {idx === 0 && (
                            <td rowSpan={3} className="p-2 font-bold bg-gray-50 dark:bg-slate-800/50 border-r dark:border-slate-700 text-gray-900 dark:text-white">
                              {tier}
                            </td>
                          )}
                          <td className="p-2 border-r dark:border-slate-700 text-gray-600 dark:text-gray-400">{duration}</td>
                          <td className="p-1 border-r dark:border-slate-700">
                            {turPrice ? (
                              <button onClick={() => handlePlanClick({ platform: "PlayStation", region: "Турция", tier, duration })} className="w-full py-2 bg-white dark:bg-slate-700 rounded hover:bg-blue-100 dark:hover:bg-blue-900 text-gray-800 dark:text-white transition-colors font-bold">
                                {turPrice} ₽
                              </button>
                            ) : <span className="text-gray-300 dark:text-gray-600">—</span>}
                          </td>
                          <td className="p-1">
                            {ukrPrice ? (
                              <button onClick={() => handlePlanClick({ platform: "PlayStation", region: "Украина", tier, duration })} className="w-full py-2 bg-white dark:bg-slate-700 rounded hover:bg-blue-100 dark:hover:bg-blue-900 text-gray-800 dark:text-white transition-colors font-bold">
                                {ukrPrice} ₽
                              </button>
                            ) : <span className="text-gray-300 dark:text-gray-600">—</span>}
                          </td>
                        </tr>
                      );
                    })
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Xbox */}
        <div className="glass-panel rounded-2xl overflow-hidden">
          <button onClick={() => setOpenXbox(!openXbox)} className="w-full flex items-center justify-between p-4 bg-green-500/10 hover:bg-green-500/20 transition-colors">
            <h3 className="text-lg font-bold text-green-600 dark:text-green-400 flex flex-wrap items-center gap-2">
              <Gamepad2 size={20} /> 
              <span>Подписка Xbox Game Pass Ultimate</span>
              <span className="text-xs font-semibold bg-green-200 text-green-800 dark:bg-green-900/60 dark:text-green-300 px-2 py-0.5 rounded-md">
                Регион: Турция
              </span>
            </h3>
            {openXbox ? <ChevronUp size={20} className="text-green-500 shrink-0" /> : <ChevronDown size={20} className="text-green-500 shrink-0" />}
          </button>
          
          {openXbox && (
            <div className="p-4 overflow-x-auto">
              <table className="w-full text-sm text-center">
                <thead>
                  <tr className="bg-gray-100 dark:bg-slate-800 text-gray-700 dark:text-gray-300">
                    <th className="p-2 border dark:border-slate-700">Срок</th>
                    <th className="p-2 border dark:border-slate-700">Действующий аккаунт</th>
                    <th className="p-2 border dark:border-slate-700">Новый аккаунт</th>
                  </tr>
                </thead>
                <tbody>
                  {xboxDurations.map(duration => {
                    const oldPrice = getXboxPrice("Действующий", duration);
                    const newPrice = getXboxPrice("Новый", duration);
                    if (!oldPrice && !newPrice) return null;
                    return (
                      <tr key={duration} className="border-b dark:border-slate-700">
                        <td className="p-2 font-bold bg-gray-50 dark:bg-slate-800/50 border-r dark:border-slate-700 text-gray-900 dark:text-white">{duration}</td>
                        <td className="p-1 border-r dark:border-slate-700">
                          {oldPrice ? <button onClick={() => handlePlanClick({ platform: "Xbox", accountType: "Действующий", duration })} className="w-full py-2 bg-white dark:bg-slate-700 rounded hover:bg-green-100 dark:hover:bg-green-900 text-gray-800 dark:text-white transition-colors font-bold">{oldPrice} ₽</button> : <span className="text-gray-300 dark:text-gray-600">—</span>}
                        </td>
                        <td className="p-1">
                          {newPrice ? <button onClick={() => handlePlanClick({ platform: "Xbox", accountType: "Новый", duration })} className="w-full py-2 bg-white dark:bg-slate-700 rounded hover:bg-green-100 dark:hover:bg-green-900 text-gray-800 dark:text-white transition-colors font-bold">{newPrice} ₽</button> : <span className="text-gray-300 dark:text-gray-600">—</span>}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

      </div>

      {/* Форма */}
      <form id="digital-form" onSubmit={handleSubmit} className="glass-panel p-6 sm:p-8 rounded-3xl space-y-6">
        <h3 className="text-xl font-bold dark:text-white mb-4">Оформление заявки</h3>
        
        {error && <div className="bg-red-100 text-red-700 p-4 rounded-xl dark:bg-red-900/30 dark:text-red-400">{error}</div>}

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pb-4 border-b border-gray-200 dark:border-slate-700">
          <div>
            <label className="block text-sm font-medium mb-2 dark:text-gray-300">Ваше имя *</label>
            <div className="relative">
              <User className="absolute left-3 top-3.5 text-gray-400 dark:text-gray-500" size={18} />
              <input required type="text" value={guestName} onChange={e => setGuestName(e.target.value)} className="w-full p-3 pl-10 rounded-xl border dark:border-slate-700 bg-gray-50 dark:bg-slate-800 dark:text-white outline-none focus:ring-2 focus:ring-blue-500" placeholder="Иван" />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium mb-2 dark:text-gray-300">Телефон *</label>
            <div className="relative">
              <Phone className="absolute left-3 top-3.5 text-gray-400 dark:text-gray-500" size={18} />
              <input required type="tel" value={guestPhone} onChange={e => setGuestPhone(e.target.value)} className="w-full p-3 pl-10 rounded-xl border dark:border-slate-700 bg-gray-50 dark:bg-slate-800 dark:text-white outline-none focus:ring-2 focus:ring-blue-500" placeholder="+7 (999) 000-00-00" />
            </div>
          </div>
        </div>

        {/* ЧЕКБОКС ПУСТОГО АККАУНТА */}
        <div className="bg-blue-50 dark:bg-slate-800/50 p-4 rounded-xl border border-blue-100 dark:border-slate-700 flex flex-col gap-2">
          <label className="flex items-center gap-3 cursor-pointer group">
            <input 
              type="checkbox" 
              checked={isEmptyAccount}
              onChange={handleEmptyAccountToggle}
              className="w-5 h-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500 dark:bg-slate-700 dark:border-slate-600 cursor-pointer"
            />
            <span className="text-sm font-medium text-gray-800 dark:text-gray-200 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
              Мне нужен только пустой аккаунт без подписки <span className="text-green-600 dark:text-green-400 font-bold">(500 рублей)</span>
            </span>
          </label>
          <p className="text-xs text-gray-500 dark:text-gray-400 pl-8">
            * Если вы покупаете игру или подписку, создание нового аккаунта <strong>бесплатно</strong>.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          {!isEmptyAccount && (
            <div>
              <label className="block text-sm font-medium mb-2 dark:text-gray-300">Название игры / подписки *</label>
              <div className="relative">
                <Tag className="absolute left-3 top-3.5 text-gray-400 dark:text-gray-500" size={18} />
                <input required type="text" value={gameTitle} onChange={e => setGameTitle(e.target.value)} className="w-full p-3 pl-10 rounded-xl border dark:border-slate-700 bg-gray-50 dark:bg-slate-800 dark:text-white outline-none focus:ring-2 focus:ring-blue-500" placeholder="Например: PS Plus Extra" />
              </div>
            </div>
          )}

          <div className={isEmptyAccount ? "sm:col-span-2" : ""}>
            <label className="block text-sm font-medium mb-2 dark:text-gray-300">Платформа *</label>
            <select value={consoleType} onChange={e => setConsoleType(e.target.value)} className="w-full p-3 rounded-xl border dark:border-slate-700 bg-gray-50 dark:bg-slate-800 dark:text-white outline-none focus:ring-2 focus:ring-blue-500">
              <option value="PlayStation">PlayStation</option>
              <option value="Xbox">Xbox</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          {!isEmptyAccount && (
            <div>
              <label className="block text-sm font-medium mb-2 dark:text-gray-300">Аккаунт *</label>
              <select required value={accountStatus} onChange={e => setAccountStatus(e.target.value)} className="w-full p-3 rounded-xl border dark:border-slate-700 bg-gray-50 dark:bg-slate-800 dark:text-white outline-none focus:ring-2 focus:ring-blue-500">
                <option value="">Выберите...</option>
                <option value="Новый">Новый аккаунт (Бесплатно при покупке)</option>
                <option value="Действующий">Действующий аккаунт</option>
              </select>
            </div>
          )}

          <div className={isEmptyAccount ? "sm:col-span-2" : ""}>
            <label className="block text-sm font-medium mb-2 dark:text-gray-300">Регион аккаунта *</label>
            <div className="relative">
              <Globe className="absolute left-3 top-3.5 text-gray-400 dark:text-gray-500" size={18} />
              {consoleType === "PlayStation" ? (
                <select required value={region} onChange={e => setRegion(e.target.value)} className="w-full p-3 pl-10 rounded-xl border dark:border-slate-700 bg-gray-50 dark:bg-slate-800 dark:text-white outline-none focus:ring-2 focus:ring-blue-500">
                  <option value="">Выберите...</option>
                  <option value="Турция">Турция</option>
                  <option value="Украина">Украина</option>
                </select>
              ) : (
                <input 
                  type="text" 
                  disabled 
                  value="Турция" 
                  className="w-full p-3 pl-10 rounded-xl border dark:border-slate-700 bg-gray-100 dark:bg-slate-900 text-gray-500 dark:text-gray-400 cursor-not-allowed" 
                />
              )}
            </div>
            {consoleType === "Xbox" && (
              <p className="text-[11px] text-gray-500 dark:text-gray-400 mt-1">
                * Для Xbox доступен только турецкий регион.
              </p>
            )}
          </div>
        </div>

        <div className="pt-4 border-t border-gray-200 dark:border-slate-700">
          <label className="block text-sm font-medium mb-2 dark:text-gray-300">Как с вами связаться? *</label>
          <div className="flex gap-2 mb-4 flex-wrap">
            {[
              { id: "telegram", label: "Telegram (ник/тел)" },
              { id: "max", label: "Max (тел)" },
              { id: "vk", label: "ВКонтакте (ссылка)" },
            ].map(m => (
              <button key={m.id} type="button" onClick={() => setContactMethod(m.id)} className={`flex-1 min-w-[100px] py-2 text-sm font-medium rounded-lg border transition-colors ${contactMethod === m.id ? 'bg-blue-500 text-white border-blue-500' : 'bg-transparent text-gray-600 dark:text-gray-400 border-gray-200 dark:border-slate-700'}`}>
                {m.label}
              </button>
            ))}
          </div>
          
          <input 
            required 
            type="text" 
            value={contactValue} 
            onChange={e => setContactValue(e.target.value)} 
            className="w-full p-3 rounded-xl border dark:border-slate-700 bg-gray-50 dark:bg-slate-800 dark:text-white outline-none focus:ring-2 focus:ring-blue-500" 
            placeholder={contactMethod === "vk" ? "Ссылка на профиль ВК или ID" : "@ваш_никнейм или номер телефона"} 
          />
        </div>

        {/* НОВАЯ ГАЛОЧКА ПОДТВЕРЖДЕНИЯ ДАННЫХ */}
        <label className="flex items-start gap-3 cursor-pointer group pt-2">
          <div className="relative flex items-center mt-0.5 shrink-0">
            <input 
              type="checkbox" 
              required
              checked={agreeToData}
              onChange={(e) => setAgreeToData(e.target.checked)}
              className="peer w-5 h-5 border-2 border-gray-300 dark:border-slate-600 rounded bg-transparent checked:bg-blue-500 checked:border-blue-500 focus:ring-blue-500 focus:ring-2 transition-colors cursor-pointer appearance-none"
            />
            <svg className="absolute w-5 h-5 pointer-events-none hidden peer-checked:block text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="20 6 9 17 4 12"></polyline>
            </svg>
          </div>
          <span className="text-sm text-gray-700 dark:text-gray-300 group-hover:text-gray-900 dark:group-hover:text-white transition-colors select-none">
            Я подтверждаю, что <strong>контактные данные</strong> (имя, телефон, мессенджер) указаны верно, и со мной можно связаться.
          </span>
        </label>

        <button 
          type="submit" 
          disabled={loading || !agreeToData} 
          className="w-full py-4 mt-4 bg-gradient-to-r from-blue-500 to-blue-700 text-white rounded-xl font-bold text-lg neon-hover shadow-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all"
        >
          {loading ? "Отправка..." : "Отправить заявку"}
        </button>
      </form>
    </div>
  );
}