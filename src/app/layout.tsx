import type { Metadata } from "next";
import { Inter, Montserrat } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/ThemeProvider";
import { CartProvider } from "@/context/CartContext";
import MobileBottomNav from "@/components/MobileBottomNav";

const inter = Inter({ subsets: ["latin", "cyrillic"], variable: "--font-inter" });
const montserrat = Montserrat({ subsets: ["latin", "cyrillic"], variable: "--font-montserrat" });

export const metadata: Metadata = {
  title: "Gadget Market | Мир игровых приставок",
  description: "Магазин игровых приставок, игр и аксессуаров в Ангарске и Иркутске.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ru" suppressHydrationWarning>
      <body className={`${inter.variable} ${montserrat.variable} antialiased`}>
        <ThemeProvider attribute="class" defaultTheme="light" enableSystem={false}>
          <CartProvider>
            {/* Добавили pb-20 (отступ снизу), чтобы нижнее меню не перекрывало контент */}
            <div className="pb-20 md:pb-0">
              {children}
            </div>
            {/* Само нижнее меню */}
            <MobileBottomNav />
          </CartProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}