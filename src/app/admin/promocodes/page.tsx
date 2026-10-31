import { Suspense } from "react";
import PromocodesClient from "./PromocodesClient";

export default function AdminPromocodesPage() {
  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Промокоды</h1>
        <p className="text-gray-500 mt-1">Управление скидками и акциями</p>
      </div>
      <Suspense fallback={<div className="p-8 text-center text-gray-500">Загрузка...</div>}>
        <PromocodesClient />
      </Suspense>
    </div>
  );
}