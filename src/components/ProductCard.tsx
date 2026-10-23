import { Heart, ShoppingCart } from "lucide-react";

interface ProductCardProps {
  title: string;
  priceCash: number;
  priceCard: number;
  availability: string;
  imageUrl?: string; // Добавили ссылку на картинку
}

export default function ProductCard({ title, priceCash, priceCard, availability, imageUrl }: ProductCardProps) {
  const isAvailable = ["В наличии", "В Ангарске", "В Иркутске"].includes(availability);

  return (
    <div className="glass-panel group rounded-2xl overflow-hidden cursor-pointer relative shadow-md transition-all duration-300 hover:-translate-y-3 hover:shadow-[0_0_20px_rgba(30,144,255,0.7),0_0_40px_rgba(30,144,255,0.4)] hover:border-blue-500">
      
      {/* Блок с картинкой */}
      <div className="aspect-square bg-gray-200 dark:bg-slate-800 relative overflow-hidden flex items-center justify-center">
         {imageUrl ? (
            <img 
              src={imageUrl} 
              alt={title} 
              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
            />
         ) : (
            <span className="text-gray-500 dark:text-gray-400 font-medium">Фото товара</span>
         )}
         
         <button className="absolute top-3 right-3 bg-white/50 backdrop-blur-md p-2 rounded-full hover:bg-white text-gray-600 transition-all z-10 opacity-0 group-hover:opacity-100 translate-y-2 group-hover:translate-y-0 shadow-sm">
            <Heart size={18} />
         </button>
      </div>

      {/* Нижняя часть с информацией */}
      <div className="p-4 flex flex-col gap-2">
        <h3 className="font-bold text-lg leading-tight line-clamp-2 dark:text-white">{title}</h3>
        
        <div className="flex flex-col mt-2">
          <span className="text-xl font-bold text-black dark:text-white">
            {(priceCash / 100).toLocaleString('ru-RU')} ₽ <span className="text-sm font-normal text-gray-500 dark:text-gray-400">нал.</span>
          </span>
          <span className="text-sm font-medium text-gray-500 dark:text-gray-400">
            {(priceCard / 100).toLocaleString('ru-RU')} ₽ <span className="text-xs">терминал</span>
          </span>
        </div>

        <div className="mt-3 flex items-center justify-between">
          <span className={`text-xs font-semibold px-2 py-1 rounded-md ${
            isAvailable 
              ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' 
              : availability === 'Под заказ' 
                ? 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400'
                : 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400'
          }`}>
            {availability}
          </span>
          
          <button className="bg-blue-500 hover:bg-blue-600 text-white p-2 rounded-lg transition-colors neon-hover z-20">
            <ShoppingCart size={18} />
          </button>
        </div>
      </div>
    </div>
  );
}