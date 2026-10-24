"use client";

import { useState } from "react";
import { ShoppingCart } from "lucide-react";
import BookingModal from "./BookingModal";

export default function BookingButton({ productId, productName }: { productId: string, productName: string }) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <button 
        onClick={() => setIsOpen(true)}
        className="w-full md:w-auto self-start flex items-center justify-center gap-2 px-8 py-4 bg-gradient-to-r from-blue-500 to-blue-700 text-white rounded-xl font-bold text-lg neon-hover shadow-lg"
      >
        <ShoppingCart size={22} />
        Забронировать
      </button>

      <BookingModal 
        productId={productId} 
        productName={productName} 
        isOpen={isOpen} 
        onClose={() => setIsOpen(false)} 
      />
    </>
  );
}