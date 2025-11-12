// app/login/page.tsx
"use client"; // Esta página DEBE ser un Client Component

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";

// Asumiendo que ya instalaste shadcn-ui
// Si no: npx shadcn-ui@latest add button input label card
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardFooter
} from "@/components/ui/card";

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Vemos si NextAuth nos mandó un error en la URL
  const authError = searchParams.get("error");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      // 1. Llamamos a la función signIn de NextAuth
      const result = await signIn("credentials", {
        redirect: false, // No redirigimos automáticamente
        email: email,
        password: password,
      });

      if (result?.error) {
        // 2. Si hay un error (ej. contraseña mal), lo mostramos
        console.error("Error de signIn:", result.error);
        setError("Credenciales incorrectas. Intenta de nuevo.");
        setIsLoading(false);
      } else {
        // 3. Si todo sale bien, redirigimos al dashboard de admin
        router.push("/router"); 
        router.refresh(); // Refresca la sesión en el servidor
      }
    } catch (error) {
      console.error("Error en handleSubmit:", error);
      setError("Ocurrió un error inesperado.");
      setIsLoading(false);
    }
  };

  return (
    <main className="flex min-h-screen items-center justify-center p-4">
      <Card className="w-full max-w-sm">
        <form onSubmit={handleSubmit}>
          <CardHeader>
            <CardTitle className="text-2xl">Iniciar Sesión</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4">
            <div className="grid gap-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="password">Contraseña</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            {(error || authError) && (
              <p className="text-sm text-red-600">
                {error || "Error de autenticación"}
              </p>
            )}
          </CardContent>
          <CardFooter>
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? "Cargando..." : "Entrar"}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </main>
  );
}