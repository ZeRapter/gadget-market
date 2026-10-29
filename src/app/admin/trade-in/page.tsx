import { Suspense } from "react";
import { prisma } from "@/lib/prisma";
import TradeInAdminClient from "./TradeInAdminClient";

async function TradeInData() {
  const requests = await prisma.tradeInRequest.findMany({
    include: { user: true },
    orderBy: { createdAt: "desc" },
  });

  return <TradeInAdminClient initialRequests={requests} />;
}

export default function AdminTradeInPage() {
  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Заявки Trade-in</h1>
        <p className="text-gray-500 mt-1">Оценка и выкуп техники у клиентов</p>
      </div>
      <Suspense fallback={<div className="p-8 text-center text-gray-500">Загрузка заявок...</div>}>
        <TradeInData />
      </Suspense>
    </div>
  );
}