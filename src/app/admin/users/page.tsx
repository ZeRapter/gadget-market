import { Suspense } from "react";
import { prisma } from "@/lib/prisma";
import UsersClient from "./UsersClient";

async function UsersData() {
  const users = await prisma.user.findMany({
    orderBy: { createdAt: "desc" },
  });

  return <UsersClient initialUsers={users} />;
}

export default function AdminUsersPage() {
  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Сотрудники</h1>
        <p className="text-gray-500 dark:text-gray-400 mt-1">Управление ролями и доступом к админ-панели</p>
      </div>
      <Suspense fallback={<div className="p-8 text-center text-gray-500 dark:text-gray-400">Загрузка пользователей...</div>}>
        <UsersData />
      </Suspense>
    </div>
  );
}