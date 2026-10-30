import { Suspense } from "react";
import { prisma } from "@/lib/prisma";
import CustomRequestsClient from "./CustomRequestsClient";

async function Data() {
  const requests = await prisma.customRequest.findMany({
    include: { user: true },
    orderBy: { createdAt: "desc" },
  });
  return <CustomRequestsClient initialRequests={requests} />;
}

export default function AdminCustomRequestsPage() {
  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Заказы товаров</h1>
        <p className="text-gray-500 dark:text-gray-400 mt-1">Заявки клиентов на поиск товаров, которых нет в каталоге</p>
      </div>
      <Suspense fallback={<div className="p-8 text-center text-gray-500 dark:text-gray-400">Загрузка заявок...</div>}>
        <Data />
      </Suspense>
    </div>
  );
}