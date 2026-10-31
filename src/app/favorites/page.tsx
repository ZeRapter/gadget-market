import { Suspense } from "react";
import Header from "@/components/Header";
import FavoritesClient from "./FavoritesClient";
import { Heart } from "lucide-react";

export default function FavoritesPage() {
  return (
    <main className="min-h-screen relative overflow-hidden p-4 pb-20">
      <div className="fixed top-[-10%] left-[-10%] w-[40%] h-[40%] bg-red-500 rounded-full mix-blend-multiply dark:mix-blend-screen filter blur-[100px] opacity-30 dark:opacity-20"></div>
      <div className="fixed top-[20%] right-[-10%] w-[30%] h-[50%] bg-pink-500 rounded-full mix-blend-multiply dark:mix-blend-screen filter blur-[100px] opacity-30 dark:opacity-20"></div>
      
      <div className="relative z-10">
        <Header />
        <div className="max-w-7xl mx-auto mt-8">
          <h1 className="text-3xl font-bold dark:text-white mb-8 flex items-center gap-3">
            <Heart className="text-red-500" size={32} /> Избранное
          </h1>
          <Suspense fallback={<div className="text-center text-gray-500 py-20">Загрузка...</div>}>
            <FavoritesClient />
          </Suspense>
        </div>
      </div>
    </main>
  );
}