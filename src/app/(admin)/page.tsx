// app/(admin)/page.tsx
// (Este es un SERVER Component, no lleva "use client")

import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent
} from "@/components/ui/card";

// 1. Importa el componente de cliente que crearemos
import SessionData from "./SessionData";

// Página Principal (Server Component)
export default async function AdminDashboardPage() {
  
  // 2. getServerSession obtiene los datos del lado del servidor
  const session = await getServerSession(authOptions);

  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-2xl font-semibold">Dashboard de Admin</h1>
      
      <Card>
        <CardHeader>
          <CardTitle>¡Bienvenido, {session?.user?.name || 'Admin'}!</CardTitle>
        </CardHeader>
        <CardContent>
          <p>Has iniciado sesión con éxito. Estos son los datos de tu sesión:</p>
          
          {/* 3. Llama al componente de cliente */}
          <SessionData />
          
        </CardContent>
      </Card>
    </div>
  );
}