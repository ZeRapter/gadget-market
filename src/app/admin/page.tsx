import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { Package, ShoppingCart, ClipboardList, RefreshCw, Gamepad2, Search, ArrowRight } from "lucide-react";

export default async function AdminDashboard() {
  // Получаем статистику по всем разделам
  const [
    productsCount,
    ordersPending, ordersProcessing, ordersCompleted,
    bookingsPending, bookingsConfirmed, bookingsCompleted,
    tradeInNew, tradeInInProgress, tradeInCompleted,
    digitalNew, digitalInProgress, digitalCompleted,
    customNew, customSearching, customFound
  ] = await Promise.all([
    prisma.product.count(),
    prisma.order.count({ where: { status: "PENDING" } }),
    prisma.order.count({ where: { status: "PROCESSING" } }),
    prisma.order.count({ where: { status: "COMPLETED" } }),
    prisma.booking.count({ where: { status: "PENDING" } }),
    prisma.booking.count({ where: { status: "CONFIRMED" } }),
    prisma.booking.count({ where: { status: "COMPLETED" } }),
    prisma.tradeInRequest.count({ where: { status: "NEW" } }),
    prisma.tradeInRequest.count({ where: { status: "IN_PROGRESS" } }),
    prisma.tradeInRequest.count({ where: { status: "COMPLETED" } }),
    prisma.digitalRequest.count({ where: { status: "NEW" } }),
    prisma.digitalRequest.count({ where: { status: "IN_PROGRESS" } }),
    prisma.digitalRequest.count({ where: { status: "COMPLETED" } }),
    prisma.customRequest.count({ where: { status: "NEW" } }),
    prisma.customRequest.count({ where: { status: "SEARCHING" } }),
    prisma.customRequest.count({ where: { status: "FOUND" } }),
  ]);

  // Компонент карточки для переиспользования
  const StatCard = ({ title, value, href, colorClass, icon }: any) => (
    <Link href={href} className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-gray-200 dark:border-slate-800 hover:shadow-lg transition-all group flex flex-col justify-between">
      <div className="flex justify-between items-start mb-4">
        <h3 className="text-gray-500 dark:text-gray-400 text-sm font-medium">{title}</h3>
        <div className={`${colorClass} bg-opacity-10 dark:bg-opacity-20 p-2 rounded-lg`}>
          {icon}
        </div>
      </div>
      <div className="flex items-end justify-between">
        <p className={`text-3xl font-bold ${colorClass}`}>{value}</p>
        <ArrowRight size={20} className="text-gray-300 dark:text-slate-600 group-hover:text-gray-600 dark:group-hover:text-gray-300 transition-colors" />
      </div>
    </Link>
  );

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Дашборд</h1>
        <p className="text-gray-500 dark:text-gray-400 mt-1">Добро пожаловать в панель управления Gadget Market, Андрей!</p>
      </div>

      {/* ТОВАРЫ */}
      <div className="mb-8">
        <h2 className="text-lg font-bold text-gray-800 dark:text-gray-200 mb-4 flex items-center gap-2"><Package size={20} /> Каталог</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard title="Всего товаров" value={productsCount} href="/admin/products" colorClass="text-blue-500" icon={<Package size={24} />} />
        </div>
      </div>

      {/* ЗАКАЗЫ С ДОСТАВКОЙ */}
      <div className="mb-8">
        <h2 className="text-lg font-bold text-gray-800 dark:text-gray-200 mb-4 flex items-center gap-2"><ShoppingCart size={20} /> Заказы (Доставка)</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <StatCard title="Новые (Ожидают)" value={ordersPending} href="/admin/orders?status=PENDING" colorClass="text-yellow-500" icon={<ShoppingCart size={24} />} />
          <StatCard title="В работе (Принято)" value={ordersProcessing} href="/admin/orders?status=PROCESSING" colorClass="text-blue-500" icon={<ShoppingCart size={24} />} />
          <StatCard title="Выполнено" value={ordersCompleted} href="/admin/orders?status=COMPLETED" colorClass="text-green-500" icon={<ShoppingCart size={24} />} />
        </div>
      </div>

      {/* БРОНИРОВАНИЯ */}
      <div className="mb-8">
        <h2 className="text-lg font-bold text-gray-800 dark:text-gray-200 mb-4 flex items-center gap-2"><ClipboardList size={20} /> Бронирования</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <StatCard title="Новые (Ожидают)" value={bookingsPending} href="/admin/bookings?status=PENDING" colorClass="text-yellow-500" icon={<ClipboardList size={24} />} />
          <StatCard title="В работе (Принято)" value={bookingsConfirmed} href="/admin/bookings?status=CONFIRMED" colorClass="text-blue-500" icon={<ClipboardList size={24} />} />
          <StatCard title="Выполнено" value={bookingsCompleted} href="/admin/bookings?status=COMPLETED" colorClass="text-green-500" icon={<ClipboardList size={24} />} />
        </div>
      </div>

      {/* TRADE-IN И ЦИФРОВЫЕ ТОВАРЫ */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        <div>
          <h2 className="text-lg font-bold text-gray-800 dark:text-gray-200 mb-4 flex items-center gap-2"><RefreshCw size={20} /> Trade-in</h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <StatCard title="Новые" value={tradeInNew} href="/admin/trade-in?status=NEW" colorClass="text-yellow-500" icon={<RefreshCw size={24} />} />
            <StatCard title="В работе" value={tradeInInProgress} href="/admin/trade-in?status=IN_PROGRESS" colorClass="text-blue-500" icon={<RefreshCw size={24} />} />
            <StatCard title="Выполнено" value={tradeInCompleted} href="/admin/trade-in?status=COMPLETED" colorClass="text-green-500" icon={<RefreshCw size={24} />} />
          </div>
        </div>

        <div>
          <h2 className="text-lg font-bold text-gray-800 dark:text-gray-200 mb-4 flex items-center gap-2"><Gamepad2 size={20} /> Цифровые товары</h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <StatCard title="Новые" value={digitalNew} href="/admin/digital?status=NEW" colorClass="text-yellow-500" icon={<Gamepad2 size={24} />} />
            <StatCard title="В работе" value={digitalInProgress} href="/admin/digital?status=IN_PROGRESS" colorClass="text-blue-500" icon={<Gamepad2 size={24} />} />
            <StatCard title="Выполнено" value={digitalCompleted} href="/admin/digital?status=COMPLETED" colorClass="text-green-500" icon={<Gamepad2 size={24} />} />
          </div>
        </div>
      </div>

      {/* ЗАКАЗЫ ТОВАРОВ (ПОД ЗАКАЗ) */}
      <div>
        <h2 className="text-lg font-bold text-gray-800 dark:text-gray-200 mb-4 flex items-center gap-2"><Search size={20} /> Заказы товаров (Поиск)</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <StatCard title="Новые" value={customNew} href="/admin/custom-requests?status=NEW" colorClass="text-yellow-500" icon={<Search size={24} />} />
          <StatCard title="В поиске" value={customSearching} href="/admin/custom-requests?status=SEARCHING" colorClass="text-blue-500" icon={<Search size={24} />} />
          <StatCard title="Найдено" value={customFound} href="/admin/custom-requests?status=FOUND" colorClass="text-green-500" icon={<Search size={24} />} />
        </div>
      </div>
    </div>
  );
}