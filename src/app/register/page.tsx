"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Lock, Mail, User, ArrowRight, Eye, EyeOff, ShieldCheck } from "lucide-react";

export default function RegisterPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState(""); // Новый стейт
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // Функция для фильтрации кириллицы (оставляет только латиницу, цифры и символы)
  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>, setter: React.Dispatch<React.SetStateAction<string>>) => {
    const filteredValue = e.target.value.replace(/[а-яА-ЯёЁ]/g, ""); // Удаляем русские буквы
    setter(filteredValue);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    // Проверка на совпадение паролей
    if (password !== confirmPassword) {
      setError("Пароли не совпадают!");
      setLoading(false);
      return;
    }

    try {
      const res = await fetch("/api/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Что-то пошло не так");
      } else {
        router.push("/login");
      }
    } catch (err) {
      setError("Ошибка сети. Попробуйте позже.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden bg-[#E0FFFF] dark:bg-[#0f172a]">
      <div className="fixed top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-500 rounded-full mix-blend-multiply dark:mix-blend-screen filter blur-[100px] opacity-30"></div>
      <div className="fixed bottom-[-20%] right-[20%] w-[50%] h-[40%] bg-purple-500 rounded-full mix-blend-multiply dark:mix-blend-screen filter blur-[100px] opacity-30"></div>

      <div className="glass-panel w-full max-w-md p-8 rounded-3xl relative z-10">
        <h1 className="text-3xl font-bold text-center mb-2 text-black dark:text-white">Регистрация</h1>
        <p className="text-center text-gray-500 dark:text-gray-400 mb-6">Создайте аккаунт в Gadget Market</p>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-xl mb-4 text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Ваше имя</label>
            <div className="relative">
              <User className="absolute left-3 top-3 text-gray-400" size={20} />
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full bg-white/50 dark:bg-black/30 border border-white/40 rounded-xl py-2.5 pl-10 pr-4 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all dark:text-white"
                placeholder="Иван Иванов"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Email</label>
            <div className="relative">
              <Mail className="absolute left-3 top-3 text-gray-400" size={20} />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-white/50 dark:bg-black/30 border border-white/40 rounded-xl py-2.5 pl-10 pr-4 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all dark:text-white"
                placeholder="you@example.com"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Пароль <span className="text-xs text-gray-400 font-normal ml-1">(только англ. буквы)</span>
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-3 text-gray-400" size={20} />
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => handlePasswordChange(e, setPassword)}
                className="w-full bg-white/50 dark:bg-black/30 border border-white/40 rounded-xl py-2.5 pl-10 pr-10 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all dark:text-white"
                placeholder="••••••••"
                required
                minLength={6}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-3 text-gray-400 hover:text-blue-500 transition-colors"
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Повторите пароль</label>
            <div className="relative">
              <ShieldCheck className="absolute left-3 top-3 text-gray-400" size={20} />
              <input
                type={showPassword ? "text" : "password"}
                value={confirmPassword}
                onChange={(e) => handlePasswordChange(e, setConfirmPassword)}
                className={`w-full bg-white/50 dark:bg-black/30 border rounded-xl py-2.5 pl-10 pr-4 focus:outline-none focus:ring-2 transition-all dark:text-white ${
                  confirmPassword && password !== confirmPassword 
                    ? "border-red-400 focus:ring-red-400" 
                    : "border-white/40 focus:ring-blue-500"
                }`}
                placeholder="••••••••"
                required
                minLength={6}
              />
            </div>
            {/* Подсказка, если пароли не совпадают */}
            {confirmPassword && password !== confirmPassword && (
              <p className="text-red-500 text-xs mt-1">Пароли не совпадают</p>
            )}
          </div>

          <button
            type="submit"
            disabled={loading || (confirmPassword !== "" && password !== confirmPassword)}
            className="w-full flex items-center justify-center gap-2 py-3 mt-4 rounded-xl bg-gradient-to-r from-blue-500 to-blue-700 text-white font-semibold neon-hover disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? "Создаем..." : "Создать аккаунт"}
            {!loading && <ArrowRight size={20} />}
          </button>
        </form>

        <div className="mt-6 text-center text-sm text-gray-600 dark:text-gray-400">
          Уже есть аккаунт?{" "}
          <Link href="/login" className="text-blue-500 hover:underline font-medium">
            Войти
          </Link>
        </div>
      </div>
    </div>
  );
}