import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { getUsuarioById } from '@/lib/data/users';
import { redirect } from "next/navigation";
import GestorProfileForm from "./GestorProfileForm";

export default async function PerfilGestorPage() {
  
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    redirect("/login");
  }

  // Obtenemos datos frescos de la BD
  const usuarioFresco = await getUsuarioById(Number(session.user.id));

  if (!usuarioFresco) {
    return <div>Error al cargar el perfil.</div>;
  }

  return (
    <div className="flex flex-col gap-6 max-w-2xl mx-auto">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-stone-800">Mi Perfil</h1>
        <p className="text-muted-foreground">Gestiona tu información personal.</p>
      </div>

      {/* Pasamos los datos frescos al formulario */}
      <GestorProfileForm user={usuarioFresco} />
    </div>
  );
}