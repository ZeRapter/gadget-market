import { Suspense } from "react";
import Header from "@/components/Header";
import DigitalForm from "./DigitalForm";
import { prisma } from "@/lib/prisma";

async function DigitalData() {
  // Загружаем все сохраненные цены
  const plans = await prisma.subscriptionPlan.findMany({
    orderBy: { sortOrder: "asc" },
  });
  return <DigitalForm plans={plans} />;
}

export default function DigitalPage() {
  return (
    <main className="min-h-screen relative overflow-hidden p-4 pb-20">
      <div className="fixed top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-500 rounded-full mix-blend-multiply dark:mix-blend-screen filter blur-[100px] opacity-30 dark:opacity-20"></div>
      <div className="fixed top-[20%] right-[-10%] w-[30%] h-[50%] bg-purple-500 rounded-full mix-blend-multiply dark:mix-blend-screen filter blur-[100px] opacity-30 dark:opacity-20"></div>
      
      <div className="relative z-10">
        <Header />
        <div className="max-w-5xl mx-auto mt-8">
          <div className="text-center mb-10">
            <h1 className="text-4xl font-bold dark:text-white mb-4">Цифровые товары</h1>
            <p className="text-gray-500 dark:text-gray-400 max-w-2xl mx-auto">
              Выберите нужную подписку из таблицы ниже, и форма заполнится автоматически. Или оставьте произвольную заявку на игру.
            </p>
          </div>
          
          <Suspense fallback={<div className="text-center text-gray-500 dark:text-gray-400 py-20">Загрузка данных...</div>}>
            <DigitalData />
          </Suspense>
        </div>
      </div>
    </main>
  );
}