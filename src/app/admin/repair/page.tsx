import { Suspense } from "react";
import { prisma } from "@/lib/prisma";
import RepairAdminClient from "./RepairAdminClient";

async function Data() {
  const services = await prisma.repairService.findMany({
    orderBy: [{ category: "asc" }, { price: "asc" }],
  });
  return <RepairAdminClient initialServices={services} />;
}

export default function AdminRepairPage() {
  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Прайс на ремонт</h1>
        <p className="text-gray-500 dark:text-gray-400 mt-1">Управление услугами и ценами</p>
      </div>
      <Suspense fallback={<div className="p-8 text-center text-gray-500 dark:text-gray-400">Загрузка...</div>}>
        <Data />
      </Suspense>
    </div>
  );
}