"use client";

import { useState, useRef } from "react";
import Link from "next/link";
import { ChevronRight } from "lucide-react";

export type Category = {
  id: string;
  name: string;
  parentId: string | null;
};

function MenuItem({ cat, allCategories }: { cat: Category, allCategories: Category[] }) {
  const [isHovered, setIsHovered] = useState(false);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  
  const children = allCategories.filter(c => c.parentId === cat.id);

  const handleMouseEnter = () => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    setIsHovered(true);
  };

  const handleMouseLeave = () => {
    timeoutRef.current = setTimeout(() => {
      setIsHovered(false);
    }, 150); 
  };

  return (
    <div 
      className="relative"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <Link 
        href={`/catalog?category=${cat.id}`}
        className={`flex items-center justify-between px-4 py-2.5 text-sm rounded-xl transition-colors ${
          isHovered 
            ? 'bg-blue-50 dark:bg-slate-800 text-blue-600 dark:text-blue-400 font-semibold' 
            : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-slate-800/50'
        }`}
      >
        <span className="truncate pr-2">{cat.name}</span>
        {children.length > 0 && <ChevronRight size={16} className="shrink-0" />}
      </Link>

      {children.length > 0 && isHovered && (
        // left-full ставит блок вплотную к правому краю, pl-2 создает невидимый мост
        <div className="absolute top-0 left-full pl-2 z-[60]">
          <div className="w-64 bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl border border-gray-200 dark:border-slate-700 shadow-xl rounded-xl p-2 flex flex-col gap-1">
            {children.map(child => (
              <MenuItem key={child.id} cat={child} allCategories={allCategories} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default function MegaMenu({ categories }: { categories: Category[] }) {
  const rootCategories = categories.filter(c => c.parentId === null);

  return (
    <div className="w-64 p-2">
      {rootCategories.map(cat => (
        <MenuItem key={cat.id} cat={cat} allCategories={categories} />
      ))}
    </div>
  );
}