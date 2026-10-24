"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from "react";

// Тип товара в корзине
export type CartItem = {
  id: string;
  name: string;
  priceCash: number;
  priceCard: number;
  imageUrl?: string;
  quantity: number;
};

type CartContextType = {
  cart: CartItem[];
  addToCart: (item: CartItem) => void;
  removeFromCart: (id: string) => void;
  clearCart: () => void;
  cartCount: number;
};

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: ReactNode }) {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isInitialized, setIsInitialized] = useState(false);

  // Загружаем корзину из localStorage при запуске
  useEffect(() => {
    const savedCart = localStorage.getItem("gadget-market-cart");
    if (savedCart) {
      try {
        setCart(JSON.parse(savedCart));
      } catch (e) {
        console.error("Ошибка загрузки корзины", e);
      }
    }
    setIsInitialized(true);
  }, []);

  // Сохраняем корзину в localStorage при каждом изменении
  useEffect(() => {
    if (isInitialized) {
      localStorage.setItem("gadget-market-cart", JSON.stringify(cart));
    }
  }, [cart, isInitialized]);

  const addToCart = (newItem: CartItem) => {
    setCart((prevCart) => {
      const existingItem = prevCart.find((item) => item.id === newItem.id);
      if (existingItem) {
        // Если товар уже есть, увеличиваем количество
        return prevCart.map((item) =>
          item.id === newItem.id ? { ...item, quantity: item.quantity + 1 } : item
        );
      }
      // Если товара нет, добавляем
      return [...prevCart, { ...newItem, quantity: 1 }];
    });
  };

  const removeFromCart = (id: string) => {
    setCart((prevCart) => prevCart.filter((item) => item.id !== id));
  };

  const clearCart = () => setCart([]);

  const cartCount = cart.reduce((total, item) => total + item.quantity, 0);

  return (
    <CartContext.Provider value={{ cart, addToCart, removeFromCart, clearCart, cartCount }}>
      {children}
    </CartContext.Provider>
  );
}

// Хук для удобного использования корзины в компонентах
export function useCart() {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
}