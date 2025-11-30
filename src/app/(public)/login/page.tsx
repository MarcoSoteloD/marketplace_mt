"use client";

import { useState, Suspense } from "react";
import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardHeader, CardTitle, CardContent, CardFooter, CardDescription } from "@/components/ui/card";
import { Eye, EyeOff, CheckCircle2, Loader2 } from "lucide-react";
import Link from "next/link";

// CREAMOS EL COMPONENTE INTERNO CON LA LÓGICA DE PARÁMETROS
function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const authError = searchParams.get("error");
  const registroExitoso = searchParams.get("registro");
  const resetExitoso = searchParams.get("reset");
  
  const callbackUrl = searchParams.get("callbackUrl") || "/"; 

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      const result = await signIn("credentials", {
        redirect: false,
        email: email,
        password: password,
      });

      if (result?.error) {
        console.error("Error de signIn:", result.error);
        setError("Credenciales incorrectas. Verifica tu correo y contraseña.");
        setIsLoading(false);
      } else {
        router.push(callbackUrl !== "/" ? callbackUrl : "/router"); 
        router.refresh();
      }
    } catch (error) {
      console.error("Error en handleSubmit:", error);
      setError("Ocurrió un error inesperado.");
      setIsLoading(false);
    }
  };

  return (
      <Card className="w-full max-w-sm rounded-3xl shadow-xl bg-white border-stone-100">
        <form onSubmit={handleSubmit}>
          <CardHeader className="text-center pb-2">
            <CardTitle className="text-2xl text-stone-700">¡Hola de nuevo!</CardTitle>
            
            {/* Mensaje de Registro Exitoso */}
            {registroExitoso === 'exitoso' && (
                <div className="flex items-center gap-2 justify-center text-sm text-green-600 bg-green-50 p-2 rounded-lg mt-2">
                    <CheckCircle2 className="h-4 w-4" />
                    <span>Cuenta creada con éxito. Inicia sesión.</span>
                </div>
            )}

            {/* Mensaje de Contraseña Restablecida */}
            {resetExitoso === 'exitoso' && (
                <div className="flex items-center gap-2 justify-center text-sm text-green-600 bg-green-50 p-2 rounded-lg mt-2">
                    <CheckCircle2 className="h-4 w-4" />
                    <span>Contraseña actualizada. Inicia sesión.</span>
                </div>
            )}
            
            {/* Solo mostramos la descripción si no hay mensajes de éxito */}
            {!registroExitoso && !resetExitoso && (
                <CardDescription>Ingresa a tu cuenta para continuar</CardDescription>
            )}
          </CardHeader>
          
          <CardContent className="grid gap-4">
            <div className="grid gap-2">
              <Label htmlFor="email" className="text-stone-700">Email</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder="tu@email.com"
                className="rounded-full"
              />
            </div>
            
            <div className="grid gap-2">
              <div className="flex justify-between items-center">
                  <Label htmlFor="password" className="text-stone-700">Contraseña</Label>
                  <Link 
                    href="/recuperar-password" 
                    className="text-xs text-orange-600 hover:underline font-medium"
                  >
                    ¿Olvidaste tu contraseña?
                  </Link>
              </div>
              <div className="relative">
                <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="rounded-full pr-10"
                />
                <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
                    onClick={() => setShowPassword(!showPassword)}
                >
                    {showPassword ? <EyeOff className="h-4 w-4 text-muted-foreground" /> : <Eye className="h-4 w-4 text-muted-foreground" />}
                </Button>
              </div>
            </div>

            {(error || authError) && (
              <p className="text-sm text-red-600 text-center bg-red-50 p-2 rounded-md">
                {error || "Error de autenticación"}
              </p>
            )}
          </CardContent>
          
          <CardFooter className="flex flex-col gap-4 pt-0">
            <Button type="submit" className="w-full bg-orange-600 hover:bg-orange-500 rounded-full" disabled={isLoading}>
              {isLoading ? "Verificando..." : "Entrar"}
            </Button>
            
            <p className="text-center text-sm text-muted-foreground">
              ¿No tienes cuenta?{" "}
              <Link href="/registro" className="font-medium text-orange-600 hover:underline">
                Regístrate gratis
              </Link>
            </p>
          </CardFooter>
        </form>
      </Card>
  );
}

// COMPONENTE PRINCIPAL: Solo un wrapper con Suspense
export default function LoginPage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-start pt-24 md:pt-32 px-4 pb-12 bg-stone-50">
      <Suspense fallback={
        <div className="w-full max-w-sm flex justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-orange-600" />
        </div>
      }>
        <LoginForm />
      </Suspense>
    </main>
  );
}