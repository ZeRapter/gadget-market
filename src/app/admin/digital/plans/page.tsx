import { Suspense } from "react";
import { prisma } from "@/lib/prisma";
import PlansAdminClient from "./PlansAdminClient";

// Отключаем кэширование для этой страницы
export const dynamic = "force-dynamic";

async function PlansData() {
  const plans = await prisma.subscriptionPlan.findMany({ orderBy: [{ platform: 'asc' }, { sortOrder: 'asc' }] });
  return <PlansAdminClient initialPlans={plans} />;
}

export default function AdminPlansPage() {
  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Управление ценами</h1>
        <p className="text-gray-500 dark:text-gray-400 mt-1">Настройка тарифов для таблиц на странице «Цифровые товары»</p>
      </div>
      <Suspense fallback={<div className="p-8 text-center text-gray-500 dark:text-gray-400">Загрузка цен...</div>}>
        <PlansData />
      </Suspense>
    </div>
  );
}