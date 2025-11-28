import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { getUsuarioById } from '@/lib/db';
import { redirect } from "next/navigation";
import AdminProfileForm from "./AdminProfileForm";

export default async function PerfilAdminPage() {
  
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    redirect("/login");
  }

  // Obtenemos datos frescos de la base de datos
  const usuarioFresco = await getUsuarioById(Number(session.user.id));

  if (!usuarioFresco) {
    return <div>Error al cargar el perfil.</div>;
  }

  return (
    <div className="flex flex-col gap-6 max-w-2xl mx-auto">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Mi Perfil</h1>
        <p className="text-muted-foreground">Administra tu información de cuenta.</p>
      </div>

      {/* Pasamos los datos frescos al formulario cliente */}
      <AdminProfileForm user={usuarioFresco} />
    </div>
  );
}