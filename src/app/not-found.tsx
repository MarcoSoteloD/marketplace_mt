import Link from "next/link"
import { Button } from "@/components/ui/button"
import Image from "next/image";

export default function NotFound() {
  return (
    <div className="flex h-screen flex-col items-center justify-center gap-4 bg-stone-50 text-center px-4">
      <div className="flex items-center">
          <Link href="/" className="flex items-center">
            <Image
              src="/mt_logo.svg"
              alt="Logo de Manos Tonilenses"
              width={200}
              height={200}
              className="h-24 w-auto"
              priority
            />
          </Link>
        </div>
      <h2 className="text-3xl font-bold text-stone-700">Página no encontrada</h2>
      <p className="text-stone-600 max-w-md">
        Lo sentimos, no pudimos encontrar lo que buscabas. Es posible que el negocio haya cerrado o la ruta no exista.
      </p>
      <Button asChild className="rounded-full bg-orange-600 hover:bg-orange-500 mt-4">
        <Link href="/">Volver al Inicio</Link>
      </Button>
    </div>
  )
}