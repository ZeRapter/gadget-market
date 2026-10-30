import Header from "@/components/Header";
import { MapPin, Phone, Clock, ExternalLink, Send } from "lucide-react";

// Компоненты для оригинальных логотипов соцсетей
const VkIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" className="w-8 h-8">
    <path d="M13.162 18.994c.609 0 .858-.406.851-.915-.031-1.917.714-2.949 2.059-1.604 1.488 1.488 1.796 2.519 3.603 2.519h3.2c.808 0 1.126-.26 1.126-.668 0-.863-1.421-2.386-2.625-3.504-1.686-1.565-1.765-1.602-.313-3.486 1.801-2.339 4.157-5.336 2.073-5.336h-3.981c-.772 0-.828.435-1.103 1.083-.995 2.347-2.886 5.387-3.604 4.922-.751-.485-.407-2.406-.35-5.261.015-.754.011-1.271-1.141-1.539-.814-.18-1.743-.276-2.739-.276-1.884 0-3.181.46-3.82 1.23-.31.37-.207.688.283.798.579.13 1.553.5 1.628 1.966.092 1.84-.094 3.078-.419 3.734-.353.71-.899.89-1.486.89-.345 0-.515-.148-.693-.334-.455-.475-.893-1.114-1.285-1.836C2.043 8.314 1.399 8.07.584 8.07H0v2.248c0 .84.352 1.326.819 1.505 1.022.393 1.858 1.478 2.791 2.878 1.4 2.1 2.755 4.293 5.165 4.293h2.387z" />
  </svg>
);

const TgIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" className="w-8 h-8">
    <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z" />
  </svg>
);

const MaxIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" className="w-8 h-8">
    {/* Стилизованный значок Max */}
    <rect x="2" y="2" width="20" height="20" rx="6" />
    <path d="M7 16V8l5 5 5-5v8" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" fill="none" />
  </svg>
);

const AvitoIcon = () => (
  <svg viewBox="0 0 24 24" className="w-8 h-8">
    <circle cx="7" cy="7" r="4" fill="#FF6163" />
    <circle cx="17" cy="7" r="4" fill="#97CF26" />
    <circle cx="7" cy="17" r="4" fill="#00AAFF" />
    <circle cx="17" cy="17" r="4" fill="#A169F7" />
  </svg>
);

export default function AboutPage() {
  return (
    <main className="min-h-screen relative overflow-hidden p-4 pb-20">
      <div className="fixed top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-500 rounded-full mix-blend-multiply dark:mix-blend-screen filter blur-[100px] opacity-30 dark:opacity-20"></div>
      <div className="fixed top-[20%] right-[-10%] w-[30%] h-[50%] bg-purple-500 rounded-full mix-blend-multiply dark:mix-blend-screen filter blur-[100px] opacity-30 dark:opacity-20"></div>
      
      <div className="relative z-10">
        <Header />
        
        <div className="max-w-5xl mx-auto mt-8">
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold dark:text-white mb-4">О компании Gadget Market</h1>
            <p className="text-gray-500 dark:text-gray-400 max-w-2xl mx-auto text-lg">
              Мы — сеть магазинов игровых приставок, аксессуаров и цифровых товаров. Работаем для вас в Ангарске и Иркутске.
            </p>
          </div>

          {/* БЛОК С ФИЛИАЛАМИ */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
            {/* Ангарск */}
            <div className="glass-panel p-8 rounded-3xl relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 rounded-bl-full -z-10 group-hover:scale-110 transition-transform"></div>
              <h2 className="text-2xl font-bold dark:text-white mb-6 flex items-center gap-2">
                <MapPin className="text-blue-500" /> Ангарск
              </h2>
              <div className="space-y-4 mb-8">
                <p className="text-gray-700 dark:text-gray-300 font-medium text-lg">192 квартал, дом 13</p>
                <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400">
                  <Clock size={18} /> <span>Ежедневно с 11:00 до 20:00</span>
                </div>
                <a href="tel:+79500654538" className="flex items-center gap-2 text-blue-600 dark:text-blue-400 font-bold hover:underline transition-colors">
                  <Phone size={18} /> <span>8 (950) 065-45-38</span>
                </a>
              </div>
              <a 
                href="https://2gis.ru/irkutsk/geo/70000001060516703" 
                target="_blank" 
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center w-full gap-2 py-3 bg-white dark:bg-slate-800 border-2 border-blue-500 text-blue-500 dark:text-blue-400 rounded-xl font-bold hover:bg-blue-50 dark:hover:bg-slate-700 transition-colors"
              >
                Открыть в 2ГИС <ExternalLink size={18} />
              </a>
            </div>

            {/* Иркутск */}
            <div className="glass-panel p-8 rounded-3xl relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500/10 rounded-bl-full -z-10 group-hover:scale-110 transition-transform"></div>
              <h2 className="text-2xl font-bold dark:text-white mb-6 flex items-center gap-2">
                <MapPin className="text-purple-500" /> Иркутск
              </h2>
              <div className="space-y-4 mb-8">
                <p className="text-gray-700 dark:text-gray-300 font-medium text-lg">Академическая 26, ТЦ «Бум», павильон 2-02</p>
                <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400">
                  <Clock size={18} /> <span>Ежедневно с 10:00 до 21:00</span>
                </div>
                <a href="tel:+79086500062" className="flex items-center gap-2 text-purple-600 dark:text-purple-400 font-bold hover:underline transition-colors">
                  <Phone size={18} /> <span>8 (908) 650-00-62</span>
                </a>
              </div>
              <a 
                href="https://2gis.ru/irkutsk/geo/70000001103191731" 
                target="_blank" 
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center w-full gap-2 py-3 bg-white dark:bg-slate-800 border-2 border-purple-500 text-purple-500 dark:text-purple-400 rounded-xl font-bold hover:bg-purple-50 dark:hover:bg-slate-700 transition-colors"
              >
                Открыть в 2ГИС <ExternalLink size={18} />
              </a>
            </div>
          </div>

          {/* БЛОК С СОЦСЕТЯМИ И МЕССЕНДЖЕРАМИ */}
          <div className="glass-panel p-8 rounded-3xl mb-8">
            <h2 className="text-2xl font-bold dark:text-white mb-6 text-center">Мы в соцсетях и мессенджерах</h2>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
              <a href="https://m.vk.ru/gadget_market138" target="_blank" rel="noopener noreferrer" className="flex flex-col items-center justify-center p-6 bg-[#0077FF]/10 dark:bg-slate-800 rounded-2xl hover:bg-[#0077FF]/20 dark:hover:bg-slate-700 transition-colors group">
                <div className="text-[#0077FF] mb-3 group-hover:scale-110 transition-transform">
                  <VkIcon />
                </div>
                <span className="font-bold text-gray-900 dark:text-white">ВКонтакте</span>
              </a>

              <a href="https://t.me/gadget_market138" target="_blank" rel="noopener noreferrer" className="flex flex-col items-center justify-center p-6 bg-[#24A1DE]/10 dark:bg-slate-800 rounded-2xl hover:bg-[#24A1DE]/20 dark:hover:bg-slate-700 transition-colors group">
                <div className="text-[#24A1DE] mb-3 group-hover:scale-110 transition-transform">
                  <TgIcon />
                </div>
                <span className="font-bold text-gray-900 dark:text-white">Telegram</span>
              </a>

              <a href="https://max.ru/join/_knVc5udP0JpqSAtCveDqa1H2F5W4Zr-MU67xzTxqrk" target="_blank" rel="noopener noreferrer" className="flex flex-col items-center justify-center p-6 bg-[#8A2BE2]/10 dark:bg-slate-800 rounded-2xl hover:bg-[#8A2BE2]/20 dark:hover:bg-slate-700 transition-colors group">
                <div className="text-[#8A2BE2] mb-3 group-hover:scale-110 transition-transform">
                  <MaxIcon />
                </div>
                <span className="font-bold text-gray-900 dark:text-white">Max</span>
              </a>

              <a href="https://www.avito.ru/brands/i52127965/all?page_from=from_item_card_icon&iid=8400004830&sellerId=df46cfe827c7ef4c4e1cd349d56e6f3f&view=gallery" target="_blank" rel="noopener noreferrer" className="flex flex-col items-center justify-center p-6 bg-gray-100 dark:bg-slate-800 rounded-2xl hover:bg-gray-200 dark:hover:bg-slate-700 transition-colors group">
                <div className="mb-3 group-hover:scale-110 transition-transform">
                  <AvitoIcon />
                </div>
                <span className="font-bold text-gray-900 dark:text-white">Авито</span>
              </a>
            </div>
          </div>

          {/* БЛОК ПОДДЕРЖКИ */}
          <div className="glass-panel p-8 rounded-3xl text-center">
            <h2 className="text-xl font-bold dark:text-white mb-4">Служба поддержки</h2>
            <p className="text-gray-500 dark:text-gray-400 mb-6 max-w-md mx-auto">
              Возникли вопросы по заказу или работе сайта? Напишите нам в Telegram или позвоните по номерам филиалов, указанным выше.
            </p>
            <a href="https://t.me/gadget_market_help" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 px-8 py-3 bg-gradient-to-r from-blue-500 to-blue-700 text-white rounded-xl font-bold neon-hover shadow-lg">
              <Send size={20} /> Написать в поддержку
            </a>
          </div>

        </div>
      </div>
    </main>
  );
}