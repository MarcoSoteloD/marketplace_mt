import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { getUsuarioById } from '@/lib/data/users';
import { getPedidosByClienteId } from '@/lib/data/orders';
import { redirect } from "next/navigation";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { User, ShoppingBag } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import EditProfileForm from "./EditProfileForm";
import { PedidosList } from "./PedidosList";
import { LogoutButton } from "./LogoutButton"; 

export default async function PerfilPage() {

  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    redirect("/login");
  }

  const usuarioFresco = await getUsuarioById(Number(session.user.id));

  // Obtenemos los datos crudos (con Decimales)
  const pedidosRaw = await getPedidosByClienteId(Number(session.user.id));
  
  // Transformamos los datos para eliminar los Decimales
  const pedidos = pedidosRaw.map(pedido => ({
    ...pedido,
    total: Number(pedido.total), // Convertimos el total del pedido
    detalle_pedido: pedido.detalle_pedido.map(detalle => ({
      ...detalle,
      precio_unitario: Number(detalle.precio_unitario) // Convertimos el precio unitario de cada item
    }))
  }));
  
  const displayName = usuarioFresco?.nombre || session.user.name || "Usuario";
  
  const userInitials = displayName
    .split(' ')
    .map((n: string) => n[0])
    .join('')
    .substring(0, 2)
    .toUpperCase();

  return (
    <div className="container max-w-5xl py-12">
      
      {/* --- ENCABEZADO DE PERFIL --- */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-6 mb-10 bg-stone-50 p-8 rounded-3xl border border-stone-100 shadow-sm">
        <div className="flex items-center gap-4">
          <Avatar className="h-20 w-20 border-4 border-white shadow-md">
            <AvatarFallback className="bg-orange-100 text-orange-600 text-2xl font-bold">
              {userInitials}
            </AvatarFallback>
          </Avatar>
          <div className="text-center md:text-left">
            <h1 className="text-3xl font-bold text-stone-800 tracking-tight">
              Hola, {displayName.split(' ')[0]}
            </h1>
            <p className="text-muted-foreground">
              {usuarioFresco?.email || session.user.email}
            </p>
          </div>
        </div>
        
        <LogoutButton />
      </div>

      {/* --- CONTENIDO CON PESTAÑAS --- */}
      <Tabs defaultValue="pedidos" className="w-full">
        <div className="flex justify-center md:justify-start mb-8">
            <TabsList className="grid w-full max-w-md grid-cols-2 h-12 rounded-full bg-stone-100 p-1">
            <TabsTrigger value="pedidos" className="rounded-full text-sm font-medium data-[state=active]:bg-white data-[state=active]:text-orange-600 data-[state=active]:shadow-sm transition-all">
                <ShoppingBag className="w-4 h-4 mr-2" />
                Mis Pedidos
            </TabsTrigger>
            <TabsTrigger value="cuenta" className="rounded-full text-sm font-medium data-[state=active]:bg-white data-[state=active]:text-orange-600 data-[state=active]:shadow-sm transition-all">
                <User className="w-4 h-4 mr-2" />
                Mis Datos
            </TabsTrigger>
            </TabsList>
        </div>

        {/* Pestaña 1: Pedidos */}
        <TabsContent value="pedidos" className="animate-in fade-in slide-in-from-bottom-4 duration-500">
             <PedidosList pedidos={pedidos} />
        </TabsContent>

        {/* Pestaña 2: Editar Perfil */}
        <TabsContent value="cuenta" className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <div className="md:col-span-2">
                    <EditProfileForm user={usuarioFresco} />
                </div>
                
                <div className="md:col-span-1">
                    <Card className="rounded-3xl bg-blue-50/50 border-blue-100">
                        <CardHeader>
                            <CardTitle className="text-blue-900 text-lg">¿Necesitas ayuda?</CardTitle>
                            <CardDescription className="text-blue-700/80">
                                Si tienes problemas con tu cuenta o un pedido reciente, contáctanos.
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <p className="text-sm text-blue-800 font-medium">soporte@manostonilenses.com</p>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}