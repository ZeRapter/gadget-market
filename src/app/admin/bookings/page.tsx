import { Suspense } from "react";
import { prisma } from "@/lib/prisma";
import BookingsClient from "./BookingsClient";

async function BookingsData() {
  const bookings = await prisma.booking.findMany({
    include: {
      user: true,
      // ТЕПЕРЬ ТОВАРЫ ЛЕЖАТ В МАССИВЕ ITEMS
      items: {
        include: {
          product: true
        }
      }
    },
    orderBy: { createdAt: "desc" },
  });

  return <BookingsClient initialBookings={bookings} />;
}

export default function AdminBookingsPage() {
  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Бронирования</h1>
        <p className="text-gray-500 mt-1">Управление заявками на бронь товаров</p>
      </div>
      <Suspense fallback={<div className="p-8 text-center text-gray-500">Загрузка броней...</div>}>
        <BookingsData />
      </Suspense>
    </div>
  );
}