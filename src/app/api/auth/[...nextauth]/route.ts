import { options } from "@/lib/auth-config";
import NextAuth from "next-auth/next";

const authHandler = NextAuth(options);

export { authHandler as GET, authHandler as POST };