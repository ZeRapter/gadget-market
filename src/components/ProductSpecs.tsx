"use client";

import { useState } from "react";
import { Info, X } from "lucide-react";

export default function ProductSpecs({ specs }: { specs: Record<string, string> }) {
  const [regionModalTarget, setRegionModalTarget] = useState<"PS4" | "PS5" | null>(null);

  if (!specs || Object.keys(specs).length === 0) return null;

  return (
    <div className="mt-10">
      <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Характеристики</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {Object.entries(specs).map(([key, value]) => {
          const isRevision = key.toLowerCase().includes("ревизия") || key.toLowerCase().includes("код консоли");
          const isPS4 = value.toUpperCase().includes("CUH");
          const isPS5 = value.toUpperCase().includes("CFI");

          return (
            <div key={key} className="flex flex-col sm:flex-row sm:justify-between p-3 bg-gray-50 dark:bg-slate-800/50 rounded-xl border border-gray-100 dark:border-slate-800">
              <span className="text-sm text-gray-500 dark:text-gray-400 flex items-center gap-1">
                {key}
                {isRevision && (isPS4 || isPS5) && (
                  <button
                    onClick={() => setRegionModalTarget(isPS4 ? "PS4" : "PS5")}
                    className="text-blue-500 hover:text-blue-600 transition-colors"
                    title="Расшифровка кодов"
                  >
                    <Info size={14} />
                  </button>
                )}
              </span>
              <span className="font-bold text-sm dark:text-white mt-1 sm:mt-0">{value}</span>
            </div>
          );
        })}
      </div>

      {/* УЛУЧШЕННОЕ МОДАЛЬНОЕ ОКНО */}
      {regionModalTarget && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white dark:bg-slate-900 w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden relative max-h-[90vh] flex flex-col">
            <div className="p-4 border-b border-gray-200 dark:border-slate-800 flex justify-between items-center bg-gray-50 dark:bg-slate-800/50 shrink-0">
              <h3 className="font-bold text-lg dark:text-white">Расшифровка кодов</h3>
              <button onClick={() => setRegionModalTarget(null)} className="p-1.5 text-gray-400 hover:text-red-500 transition-colors">
                <X size={20} />
              </button>
            </div>
            
            <div className="p-6 overflow-y-auto custom-scrollbar">
              {regionModalTarget === "PS4" && (
                <div>
                  <h4 className="font-bold text-blue-500 text-lg mb-4">PlayStation 4 (CUH-xxxx)</h4>
                  
                  {/* Анатомия кода PS4 */}
                  <div className="mb-6 bg-blue-50 dark:bg-blue-900/20 p-4 rounded-xl border border-blue-100 dark:border-blue-800">
                    <p className="text-sm text-gray-700 dark:text-gray-300 mb-2">Пример: <b>CUH-1008A</b></p>
                    <div className="flex flex-wrap gap-4 text-sm">
                      <div><span className="font-mono text-blue-600 dark:text-blue-400 font-bold">CUH</span> — Платформа</div>
                      <div><span className="font-mono text-blue-600 dark:text-blue-400 font-bold">10</span> — Поколение (1 = Fat)</div>
                      <div><span className="font-mono text-blue-600 dark:text-blue-400 font-bold">0</span> — Ревизия (0 = первая)</div>
                      <div><span className="font-mono text-blue-600 dark:text-blue-400 font-bold">08</span> — Регион</div>
                      <div><span className="font-mono text-blue-600 dark:text-blue-400 font-bold">A</span> — Память (500 ГБ)</div>
                    </div>
                  </div>

                  <h5 className="font-semibold text-gray-800 dark:text-gray-200 mb-2">Ревизии (первые две цифры):</h5>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm text-gray-700 dark:text-gray-300 mb-4">
                    <div className="bg-white dark:bg-slate-800 p-3 rounded-xl border border-gray-100 dark:border-slate-700">
                      <span className="font-bold text-blue-500 block mb-1">Fat (10, 11, 12)</span>
                      <p>10 — 1-я ревизия</p>
                      <p>11 — 2-я ревизия</p>
                      <p>12 — 3-я ревизия</p>
                    </div>
                    <div className="bg-white dark:bg-slate-800 p-3 rounded-xl border border-gray-100 dark:border-slate-700">
                      <span className="font-bold text-blue-500 block mb-1">Slim (20, 21, 22)</span>
                      <p>20 — 1-я ревизия</p>
                      <p>21 — 2-я ревизия</p>
                      <p>22 — 3-я ревизия</p>
                    </div>
                    <div className="bg-white dark:bg-slate-800 p-3 rounded-xl border border-gray-100 dark:border-slate-700">
                      <span className="font-bold text-blue-500 block mb-1">Pro (70, 71, 72)</span>
                      <p>70 — 1-я ревизия</p>
                      <p>71 — 2-я ревизия</p>
                      <p>72 — 3-я ревизия</p>
                    </div>
                  </div>

                  <h5 className="font-semibold text-gray-800 dark:text-gray-200 mb-2">Регионы (последние две цифры перед буквой):</h5>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-y-2 gap-x-4 text-sm text-gray-700 dark:text-gray-300 bg-white dark:bg-slate-800 p-4 rounded-xl border border-gray-100 dark:border-slate-700">
                    <div><span className="font-bold text-blue-500">00</span> — Япония</div>
                    <div><span className="font-bold text-blue-500">01 / 15</span> — США / Канада</div>
                    <div><span className="font-bold text-blue-500">02</span> — Австралия / Н. Зеландия</div>
                    <div><span className="font-bold text-blue-500">03</span> — Великобритания / Ирландия</div>
                    <div><span className="font-bold text-blue-500">04 / 16</span> — Европа / Африка</div>
                    <div><span className="font-bold text-blue-500">05</span> — Южная Корея</div>
                    <div><span className="font-bold text-blue-500">06</span> — Юго-Вост. Азия</div>
                    <div><span className="font-bold text-blue-500">07</span> — Тайвань</div>
                    <div><span className="font-bold text-blue-500">08</span> — Россия / СНГ</div>
                    <div><span className="font-bold text-red-500">09</span> — <span className="text-red-500">Китай</span></div>
                    <div><span className="font-bold text-blue-500">11 / 14</span> — Лат. Америка</div>
                    <div><span className="font-bold text-blue-500">12</span> — Гонконг</div>
                  </div>

                  <div className="mt-4 p-3 bg-gray-100 dark:bg-slate-700 rounded-lg text-sm text-gray-700 dark:text-gray-300">
                    <b>Буква в конце:</b> <span className="font-bold text-blue-500">A</span> — 500 ГБ, <span className="font-bold text-blue-500">B</span> — 1 ТБ.
                  </div>
                </div>
              )}

              {regionModalTarget === "PS5" && (
                <div>
                  <h4 className="font-bold text-blue-500 text-lg mb-4">PlayStation 5 (CFI-xxxx)</h4>
                  
                  {/* Анатомия кода PS5 */}
                  <div className="mb-6 bg-blue-50 dark:bg-blue-900/20 p-4 rounded-xl border border-blue-100 dark:border-blue-800">
                    <p className="text-sm text-gray-700 dark:text-gray-300 mb-2">Пример: <b>CFI-1016A</b></p>
                    <div className="flex flex-wrap gap-4 text-sm">
                      <div><span className="font-mono text-blue-600 dark:text-blue-400 font-bold">CFI</span> — Платформа</div>
                      <div><span className="font-mono text-blue-600 dark:text-blue-400 font-bold">10</span> — Поколение (1 = Fat, 2 = Slim, 7 = Pro)</div>
                      <div><span className="font-mono text-blue-600 dark:text-blue-400 font-bold">1</span> — Ревизия (0 = первая, 1 = вторая, 2 = третья)</div>
                      <div><span className="font-mono text-blue-600 dark:text-blue-400 font-bold">16</span> — Регион</div>
                      <div><span className="font-mono text-blue-600 dark:text-blue-400 font-bold">A</span> — Дисковод</div>
                    </div>
                  </div>

                  <h5 className="font-semibold text-gray-800 dark:text-gray-200 mb-2">Ревизии (первые две цифры):</h5>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm text-gray-700 dark:text-gray-300 mb-4">
                    <div className="bg-white dark:bg-slate-800 p-3 rounded-xl border border-gray-100 dark:border-slate-700">
                      <span className="font-bold text-blue-500 block mb-1">Fat (10, 11, 12)</span>
                      <p>10 — 1-я ревизия (2020)</p>
                      <p>11 — 2-я ревизия (2021)</p>
                      <p>12 — 3-я ревизия (2022)</p>
                    </div>
                    <div className="bg-white dark:bg-slate-800 p-3 rounded-xl border border-gray-100 dark:border-slate-700">
                      <span className="font-bold text-blue-500 block mb-1">Slim (20, 21)</span>
                      <p>20 — 1-я ревизия (2023)</p>
                      <p>21 — 2-я ревизия (2025)</p>
                    </div>
                    <div className="bg-white dark:bg-slate-800 p-3 rounded-xl border border-gray-100 dark:border-slate-700">
                      <span className="font-bold text-blue-500 block mb-1">Pro (70, 71)</span>
                      <p>70 — 1-я ревизия (2024)</p>
                      <p>71 — 2-я ревизия (2025)</p>
                    </div>
                  </div>

                  <h5 className="font-semibold text-gray-800 dark:text-gray-200 mb-2">Регионы (последние две цифры перед буквой):</h5>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-y-2 gap-x-4 text-sm text-gray-700 dark:text-gray-300 bg-white dark:bg-slate-800 p-4 rounded-xl border border-gray-100 dark:border-slate-700">
                    <div><span className="font-bold text-blue-500">00</span> — Япония</div>
                    <div><span className="font-bold text-blue-500">02</span> — Австралия / Н. Зеландия</div>
                    <div><span className="font-bold text-blue-500">08</span> — Россия / СНГ</div>
                    <div><span className="font-bold text-red-500">09</span> — <span className="text-red-500">Китай</span></div>
                    <div><span className="font-bold text-blue-500">14</span> — Центр. Америка</div>
                    <div><span className="font-bold text-blue-500">15</span> — США / Канада</div>
                    <div><span className="font-bold text-blue-500">16</span> — Европа / Африка</div>
                    <div><span className="font-bold text-blue-500">18</span> — Азия / Гонконг</div>
                  </div>

                  <div className="mt-4 p-3 bg-gray-100 dark:bg-slate-700 rounded-lg text-sm text-gray-700 dark:text-gray-300">
                    <b>Буква в конце:</b> <span className="font-bold text-blue-500">A</span> — с дисководом, <span className="font-bold text-blue-500">B</span> — Digital (без дисковода).
                  </div>
                </div>
              )}
            </div>
            
            <div className="p-4 border-t border-gray-200 dark:border-slate-800 bg-gray-50 dark:bg-slate-800/50 text-right shrink-0">
              <button onClick={() => setRegionModalTarget(null)} className="px-6 py-2 bg-blue-500 text-white rounded-xl font-bold hover:bg-blue-600 transition-colors">
                Понятно
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}