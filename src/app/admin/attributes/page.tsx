import { Suspense } from "react";
import AttributesClient from "./AttributesClient";

export default function AdminAttributesPage() {
  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Справочники</h1>
        <p className="text-gray-500 mt-1">Управление характеристиками и моделями товаров</p>
      </div>
      <Suspense fallback={<div className="p-8 text-center text-gray-500">Загрузка справочника...</div>}>
        <AttributesClient />
      </Suspense>
    </div>
  );
}