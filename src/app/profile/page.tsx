import { Suspense } from "react";
import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import Header from "@/components/Header";
import ProfileClient from "./ProfileClient";

async function ProfileData() {
  const session = await auth();

  if (!session?.user) {
    redirect("/login");
  }

  const userId = (session.user as any).id;

  // Загружаем БРОНИ
  const bookings = await prisma.booking.findMany({
    where: { userId: userId },
    include: { 
      items: {
        include: { product: true }
      } 
    },
    orderBy: { createdAt: "desc" },
  });

  // Загружаем ЗАКАЗЫ
  const orders = await prisma.order.findMany({
    where: { userId: userId },
    include: { 
      items: {
        include: { product: true }
      } 
    },
    orderBy: { createdAt: "desc" },
  });

  return <ProfileClient user={session.user} initialBookings={bookings} initialOrders={orders} />;
}

export default function ProfilePage() {
  return (
    <main className="min-h-screen relative overflow-hidden p-4 pb-20">
      <div className="fixed top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-500 rounded-full mix-blend-multiply dark:mix-blend-screen filter blur-[100px] opacity-30 dark:opacity-20"></div>
      <div className="fixed top-[20%] right-[-10%] w-[30%] h-[50%] bg-purple-500 rounded-full mix-blend-multiply dark:mix-blend-screen filter blur-[100px] opacity-30 dark:opacity-20"></div>
      
      <div className="relative z-10">
        <Header />
        <div className="max-w-7xl mx-auto mt-8">
          <Suspense fallback={<div className="text-center text-gray-500 py-20">Загрузка профиля...</div>}>
             <ProfileData />
          </Suspense>
        </div>
      </div>
    </main>
  );
}