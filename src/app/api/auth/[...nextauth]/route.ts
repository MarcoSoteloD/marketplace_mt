import NextAuth from "next-auth";
import { authOptions } from "@/lib/auth"; // Importamos la configuración desde el nuevo archivo

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };