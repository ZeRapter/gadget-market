export default function AdminDashboard() {
  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Дашборд</h1>
      <p className="text-gray-500 mb-8">Добро пожаловать в панель управления Gadget Market, Андрей!</p>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-gray-200 dark:border-slate-800">
          <h3 className="text-gray-500 text-sm font-medium">Всего товаров</h3>
          <p className="text-3xl font-bold text-blue-500 mt-2">1</p>
        </div>
        <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-gray-200 dark:border-slate-800">
          <h3 className="text-gray-500 text-sm font-medium">Новые заказы</h3>
          <p className="text-3xl font-bold text-green-500 mt-2">0</p>
        </div>
        <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-gray-200 dark:border-slate-800">
          <h3 className="text-gray-500 text-sm font-medium">Активные брони</h3>
          <p className="text-3xl font-bold text-purple-500 mt-2">0</p>
        </div>
      </div>
    </div>
  );
}