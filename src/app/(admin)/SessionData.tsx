// app/(admin)/SessionData.tsx

"use client"; // <-- ¡LA DIRECTIVA VA ARRIBA DE TODO!

import { useSession } from "next-auth/react";

export default function SessionData() {
  // useSession obtiene los datos del lado del cliente
  const { data: session, status } = useSession();

  if (status === "loading") {
    return <p>Cargando sesión...</p>;
  }

  if (!session) {
    return <p>No se pudo cargar la sesión.</p>;
  }

  return (
    <pre className="mt-4 p-4 bg-muted rounded-md overflow-x-auto">
      {JSON.stringify(session, null, 2)}
    </pre>
  );
}