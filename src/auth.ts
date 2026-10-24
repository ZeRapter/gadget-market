import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: PrismaAdapter(prisma),
  session: { strategy: "jwt" },
  providers: [
    Credentials({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Пароль", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;

        const user = await prisma.user.findUnique({
          where: { email: credentials.email as string },
        });

        if (!user || !user.password) return null;

        const isValid = await bcrypt.compare(
          credentials.password as string,
          user.password
        );

        if (!isValid) return null;

        return { id: user.id, name: user.name, email: user.email, role: user.role, phone: user.phone };
      },
    }),
  ],
  callbacks: {
    // Добавляем trigger и session в аргументы
    async jwt({ token, user, trigger, session }) {
      // Когда пользователь только зашел
      if (user) {
        token.role = (user as any).role;
        token.id = user.id;
        token.phone = (user as any).phone;
        token.name = user.name;
      }
      
      // Когда мы вызываем update() из профиля
      if (trigger === "update" && session) {
        token.name = session.name;
        token.phone = session.phone;
      }
      
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        (session.user as any).role = token.role;
        (session.user as any).id = token.id;
        (session.user as any).phone = token.phone;
        session.user.name = token.name; // Обновляем и имя
      }
      return session;
    },
  },
  pages: {
    signIn: "/login",
  },
});