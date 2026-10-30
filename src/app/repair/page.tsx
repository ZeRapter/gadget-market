import Header from "@/components/Header";
import { prisma } from "@/lib/prisma";
import { Wrench, Phone, Send, Gamepad2, Monitor } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function RepairPage() {
  const services = await prisma.repairService.findMany({
    // Сортируем строго по sortOrder (как ты расставил в админке)
    orderBy: [{ sortOrder: "asc" }],
  });

  const groupedServices: Record<string, typeof services> = {};
  for (const service of services) {
    if (!groupedServices[service.name]) {
      groupedServices[service.name] = [];
    }
    groupedServices[service.name].push(service);
  }

  return (
    <main className="min-h-screen relative overflow-hidden p-4 pb-20">
      <div className="fixed top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-500 rounded-full mix-blend-multiply dark:mix-blend-screen filter blur-[100px] opacity-30 dark:opacity-20"></div>
      <div className="fixed top-[20%] right-[-10%] w-[30%] h-[50%] bg-purple-500 rounded-full mix-blend-multiply dark:mix-blend-screen filter blur-[100px] opacity-30 dark:opacity-20"></div>
      
      <div className="relative z-10">
        <Header />
        
        <div className="max-w-5xl mx-auto mt-8">
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold dark:text-white mb-4 flex items-center justify-center gap-3">
              <Wrench className="text-blue-500" size={40} /> Ремонт и обслуживание
            </h1>
            <p className="text-gray-500 dark:text-gray-400 max-w-2xl mx-auto text-lg">
              Профессиональный ремонт игровых приставок, персональных компьютеров и мобильных телефонов.
            </p>
          </div>

          <div className="glass-panel p-6 sm:p-8 rounded-3xl mb-8 overflow-x-auto">
            <table className="w-full text-left text-sm border-collapse">
              <thead>
                <tr className="border-b-2 border-gray-200 dark:border-slate-700">
                  <th className="py-4 px-2 font-bold text-gray-600 dark:text-gray-300 w-1/3">Вид услуги</th>
                  <th className="py-4 px-2 font-bold text-gray-600 dark:text-gray-300 w-1/3">Устройство / Модель</th>
                  <th className="py-4 px-2 font-bold text-gray-600 dark:text-gray-300 text-right">Стоимость</th>
                </tr>
              </thead>
              {Object.entries(groupedServices).map(([serviceName, items]) => (
                <tbody key={serviceName} className="border-b border-gray-100 dark:border-slate-800 last:border-0">
                  {items.map((service, itemIndex) => (
                    <tr key={service.id} className="group hover:bg-gray-50 dark:hover:bg-slate-800/30 transition-colors">
                      
                      {itemIndex === 0 && (
                        <td 
                          rowSpan={items.length} 
                          className="py-4 px-2 align-top font-medium text-gray-900 dark:text-white border-r border-gray-100 dark:border-slate-800"
                        >
                          {serviceName}
                        </td>
                      )}

                      <td className="py-4 px-2 text-gray-600 dark:text-gray-400">
                        <div className="flex items-center gap-2">
                          {service.category === "ПК" ? (
                            <Monitor size={14} className="text-purple-500 shrink-0" />
                          ) : (
                            <Gamepad2 size={14} className="text-blue-500 shrink-0" />
                          )}
                          <span>{service.deviceModel || (service.category === "ПК" ? "ПК / Ноутбук" : "Все приставки")}</span>
                        </div>
                      </td>

                      <td className="py-4 px-2 font-bold text-blue-500 text-right whitespace-nowrap">
                        {service.isFromPrice ? "от " : ""}{service.price} ₽ {service.priceUnit ? <span className="text-sm font-normal text-gray-500 dark:text-gray-400">/ {service.priceUnit}</span> : ""}
                      </td>
                    </tr>
                  ))}
                </tbody>
              ))}
            </table>
            
            {services.length === 0 && (
              <p className="text-gray-500 dark:text-gray-400 text-center py-8">Прайс обновляется...</p>
            )}
          </div>

          <div className="glass-panel p-8 rounded-3xl text-center">
            <h2 className="text-xl font-bold dark:text-white mb-4">Узнать подробности о ремонте</h2>
            <p className="text-gray-500 dark:text-gray-400 mb-6 max-w-2xl mx-auto">
              Не нашли нужную услугу в списке или хотите уточнить точную стоимость и сроки конкретного ремонта? Позвоните нам или напишите в поддержку, и мы ответим на ваши вопросы.
            </p>
            
            <div className="flex flex-col sm:flex-row justify-center gap-4 mb-6">
              <a href="tel:+79500654538" className="flex items-center justify-center gap-2 px-8 py-3 bg-white dark:bg-slate-800 border-2 border-blue-500 text-blue-500 dark:text-blue-400 rounded-xl font-bold hover:bg-blue-50 dark:hover:bg-slate-700 transition-colors">
                <Phone size={20} /> Ангарск: 8 (950) 065-45-38
              </a>
              <a href="tel:+79086500062" className="flex items-center justify-center gap-2 px-8 py-3 bg-white dark:bg-slate-800 border-2 border-purple-500 text-purple-500 dark:text-purple-400 rounded-xl font-bold hover:bg-purple-50 dark:hover:bg-slate-700 transition-colors">
                <Phone size={20} /> Иркутск: 8 (908) 650-00-62
              </a>
            </div>

            <a href="https://t.me/gadget_market_help" target="_blank" rel="noopener noreferrer" className="inline-flex items-center justify-center gap-2 px-8 py-3 bg-[#24A1DE] hover:bg-[#1E88C1] text-white rounded-xl font-bold shadow-lg transition-colors w-full sm:w-auto">
              <Send size={20} /> Написать в поддержку (Telegram)
            </a>
          </div>
        </div>
      </div>
    </main>
  );
}