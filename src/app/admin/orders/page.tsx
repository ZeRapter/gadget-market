import { Suspense } from "react";
import { prisma } from "@/lib/prisma";
import OrdersClient from "./OrdersClient";

async function OrdersData() {
  const orders = await prisma.order.findMany({
    include: {
      user: true,
      items: { include: { product: true } }
    },
    orderBy: { createdAt: "desc" },
  });

  return <OrdersClient initialOrders={orders} />;
}

export default function AdminOrdersPage() {
  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Заказы с доставкой</h1>
        <p className="text-gray-500 mt-1">Управление заказами клиентов из других городов</p>
      </div>
      <Suspense fallback={<div className="p-8 text-center text-gray-500">Загрузка заказов...</div>}>
        <OrdersData />
      </Suspense>
    </div>
  );
}