import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { getPedidosByClienteId } from '@/lib/db';
import { redirect } from "next/navigation";
import EditProfileForm from "./EditProfileForm";
import { PedidosList } from "./PedidosList";

export default async function PerfilPage() {

  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    redirect("/login");
  }

  // Obtenemos el historial de pedidos en el servidor
  const pedidos = await getPedidosByClienteId(Number(session.user.id));

  return (
    <div className="container py-12">
      <h1 className="text-3xl font-bold text-stone-700 tracking-tight mb-8">
        Mi Perfil
      </h1>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">

        {/* --- Columna Izquierda: Formulario de Edición --- */}
        <div className="md:col-span-1">
          <EditProfileForm />
        </div>

        {/* --- Columna Derecha: Historial de Pedidos --- */}
        <div className="md:col-span-2">
            {/* Le pasamos los datos al componente cliente */}
            <PedidosList pedidos={pedidos} />
        </div>
      </div>
    </div>
  );
}