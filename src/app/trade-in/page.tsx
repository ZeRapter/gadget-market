import { Suspense } from "react";
import Header from "@/components/Header";
import TradeInForm from "./TradeInForm";

export default function TradeInPage() {
  return (
    <main className="min-h-screen relative overflow-hidden p-4 pb-20">
      <div className="fixed top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-500 rounded-full mix-blend-multiply dark:mix-blend-screen filter blur-[100px] opacity-30 dark:opacity-20"></div>
      <div className="fixed top-[20%] right-[-10%] w-[30%] h-[50%] bg-purple-500 rounded-full mix-blend-multiply dark:mix-blend-screen filter blur-[100px] opacity-30 dark:opacity-20"></div>
      
      <div className="relative z-10">
        <Header />
        <div className="max-w-3xl mx-auto mt-8">
          <div className="text-center mb-10">
            <h1 className="text-4xl font-bold dark:text-white mb-4">Trade-in (Обмен техники)</h1>
            <p className="text-gray-500 dark:text-gray-400 max-w-xl mx-auto">
              Сдайте свою старую технику и получите скидку на покупку новой! Заполните форму, и мы оценим ваше устройство.
            </p>
          </div>
          
          <Suspense fallback={<div className="text-center text-gray-500 py-20">Загрузка формы...</div>}>
            <TradeInForm />
          </Suspense>
        </div>
      </div>
    </main>
  );
}