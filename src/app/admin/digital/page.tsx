import { Suspense } from "react";
import { prisma } from "@/lib/prisma";
import DigitalAdminClient from "./DigitalAdminClient";

async function DigitalData() {
  const requests = await prisma.digitalRequest.findMany({
    include: { user: true },
    orderBy: { createdAt: "desc" },
  });

  return <DigitalAdminClient initialRequests={requests} />;
}

export default function AdminDigitalPage() {
  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Цифровые товары</h1>
        <p className="text-gray-500 dark:text-gray-400 mt-1">Заявки на игры, подписки и аккаунты</p>
      </div>
      <Suspense fallback={<div className="p-8 text-center text-gray-500 dark:text-gray-400">Загрузка заявок...</div>}>
        <DigitalData />
      </Suspense>
    </div>
  );
}