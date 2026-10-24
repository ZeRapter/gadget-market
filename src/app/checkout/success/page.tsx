import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import Link from "next/link";
import Header from "@/components/Header";
import { CheckCircle2, ShieldCheck, Mail, Clock } from "lucide-react";

async function SuccessContent({ searchParamsPromise }: { searchParamsPromise: Promise<{ id?: string, type?: string }> }) {
  const searchParams = await searchParamsPromise;
  const id = searchParams.id;
  const type = searchParams.type; 

  if (!id || !type) notFound();

  let code = null;
  let title = "";
  let desc = "";
  let isOrder = type === "order";

  if (isOrder) {
    const order = await prisma.order.findUnique({ where: { id } });
    if (!order) notFound();
    title = "Заказ успешно оформлен!";
    desc = "Наш менеджер свяжется с вами в ближайшее время для уточнения стоимости доставки и сроков.";
  } else if (type === "booking") {
    const booking = await prisma.booking.findUnique({ where: { id } });
    if (!booking) notFound();
    code = booking.pickupCode;
    title = "Бронь успешно оформлена!";
    desc = "Мы свяжемся с вами для подтверждения. Товар будет ждать вас в магазине.";
  }

  return (
    <div className="max-w-2xl mx-auto mt-12 glass-panel p-8 sm:p-12 text-center rounded-3xl relative overflow-hidden">
      <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-blue-400 to-purple-500"></div>
      
      <CheckCircle2 size={80} className="text-green-500 mx-auto mb-6" />
      <h1 className="text-3xl font-bold dark:text-white mb-4">{title}</h1>
      <p className="text-gray-600 dark:text-gray-400 mb-8">{desc}</p>

      {/* Если это ЗАКАЗ (доставка) - показываем инфу про почту */}
      {isOrder && (
        <div className="bg-blue-50 dark:bg-slate-800/80 border border-blue-200 dark:border-blue-700 rounded-2xl p-6 mb-8 text-left flex gap-4">
          <Mail className="text-blue-500 shrink-0 mt-1" size={24} />
          <div>
            <p className="font-bold text-gray-900 dark:text-white mb-1">Проверьте почту</p>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Если вы указали email, мы отправили туда письмо с деталями заказа. 
              Также вы можете следить за статусом в <Link href="/profile" className="text-blue-500 underline">личном кабинете</Link>.
            </p>
          </div>
        </div>
      )}

      {/* Если это БРОНЬ (самовывоз) - показываем КОД */}
      {!isOrder && code && (
        <div className="bg-blue-50 dark:bg-slate-800/80 border-2 border-dashed border-blue-300 dark:border-blue-700 rounded-2xl p-6 mb-8">
          <p className="text-sm font-bold text-blue-600 dark:text-blue-400 uppercase tracking-wider mb-2 flex items-center justify-center gap-2">
            <ShieldCheck size={18} /> Ваш код получения
          </p>
          <div className="text-5xl font-mono font-bold text-gray-900 dark:text-white tracking-[0.2em] mb-4">
            {code}
          </div>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Обязательно <strong>сохраните или сфотографируйте</strong> этот код. 
            Вы должны будете назвать его продавцу при получении товара.
          </p>
        </div>
      )}

      <div className="flex flex-col sm:flex-row justify-center gap-4">
        <Link href="/" className="px-6 py-3 bg-blue-500 text-white rounded-xl font-medium hover:bg-blue-600 transition-colors">
          На главную
        </Link>
        <Link href="/profile" className="px-6 py-3 bg-gray-100 dark:bg-slate-800 text-gray-700 dark:text-gray-300 rounded-xl font-medium hover:bg-gray-200 dark:hover:bg-slate-700 transition-colors">
          Мои заказы
        </Link>
      </div>
    </div>
  );
}

export default function SuccessPage({ searchParams }: { searchParams: Promise<{ id?: string, type?: string }> }) {
  return (
    <main className="min-h-screen relative overflow-hidden p-4 pb-20">
      <div className="fixed top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-500 rounded-full mix-blend-multiply dark:mix-blend-screen filter blur-[100px] opacity-30 dark:opacity-20"></div>
      <div className="fixed bottom-[-20%] right-[20%] w-[50%] h-[40%] bg-purple-500 rounded-full mix-blend-multiply dark:mix-blend-screen filter blur-[100px] opacity-30 dark:opacity-20"></div>
      
      <div className="relative z-10">
        <Header />
        <SuccessContent searchParamsPromise={searchParams} />
      </div>
    </main>
  );
}