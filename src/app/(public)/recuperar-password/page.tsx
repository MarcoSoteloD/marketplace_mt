"use client";

import Link from 'next/link';
import { useFormState, useFormStatus } from 'react-dom';
import { sendResetEmailAction, ForgotPasswordState } from './actions';
import { useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { useToast } from '@/hooks/use-toast';
import { ArrowLeft, Mail } from 'lucide-react';

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" className="w-full rounded-full bg-orange-600 hover:bg-orange-500" disabled={pending}>
      {pending ? 'Enviando...' : 'Enviar enlace de recuperación'}
    </Button>
  );
}

export default function RecuperarPasswordPage() {
  const initialState: ForgotPasswordState = undefined;
  const [state, dispatch] = useFormState(sendResetEmailAction, initialState);
  const { toast } = useToast();

  useEffect(() => {
    if (state?.message) {
      toast({
        variant: state.success ? "success" : "destructive",
        title: state.success ? "Correo Enviado" : "Error",
        description: state.message,
      });
    }
  }, [state, toast]);

  return (
    <main className="flex min-h-[calc(100vh-112px)] flex-col items-center justify-start pt-20 px-4 bg-stone-50/30">
      
      <Card className="w-full max-w-md rounded-3xl shadow-lg border-stone-100">
        <CardHeader className="text-center pb-2">
          <div className="mx-auto bg-orange-100 p-3 rounded-full w-fit mb-4">
             <Mail className="h-6 w-6 text-orange-600" />
          </div>
          <CardTitle className="text-2xl text-stone-700">Recuperar Contraseña</CardTitle>
          <CardDescription>
            Ingresa tu correo electrónico y te enviaremos un enlace para restablecer tu contraseña.
          </CardDescription>
        </CardHeader>
        
        <form action={dispatch}>
          <CardContent className="space-y-4">
            <div className="grid gap-2">
              <Label htmlFor="email" className="text-stone-700">Correo Electrónico</Label>
              <Input 
                id="email" 
                name="email" 
                type="email" 
                placeholder="tu@email.com" 
                className="rounded-full" 
                required 
              />
              {state?.errors?.email && (
                <p className="text-xs text-red-500 ml-2">{state.errors.email[0]}</p>
              )}
            </div>
            
            {state?.success === false && state.message && (
                <p className="text-sm text-red-500 text-center">{state.message}</p>
            )}
             
             {/* Mensaje de éxito visual */}
             {state?.success && (
                <div className="bg-green-50 border border-green-200 text-green-700 text-sm p-3 rounded-xl text-center">
                    ✅ {state.message}
                </div>
             )}

          </CardContent>
          
          <CardFooter className="flex flex-col gap-4 pt-2">
            <SubmitButton />
            <Button variant="link" asChild className="text-stone-500 hover:text-stone-800">
              <Link href="/login" className="flex items-center gap-2">
                <ArrowLeft className="h-4 w-4" />
                Volver al inicio de sesión
              </Link>
            </Button>
          </CardFooter>
        </form>
      </Card>
    </main>
  );
}