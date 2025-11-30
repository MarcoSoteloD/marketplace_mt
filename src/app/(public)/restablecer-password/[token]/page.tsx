"use client";

import { useFormState, useFormStatus } from 'react-dom';
import { resetPasswordAction, ResetPasswordState } from './actions';
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Eye, EyeOff, LockKeyhole } from 'lucide-react'; 
import { useToast } from '@/hooks/use-toast';

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" className="w-full rounded-full bg-orange-600 hover:bg-orange-500" disabled={pending}>
      {pending ? 'Actualizando...' : 'Cambiar Contraseña'}
    </Button>
  );
}

export default function RestablecerPasswordPage({ params }: { params: { token: string } }) {
  const initialState: ResetPasswordState = undefined;
  const [state, dispatch] = useFormState(resetPasswordAction, initialState);
  const { toast } = useToast();
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    if (state?.message) {
      toast({
        variant: "destructive",
        title: "Error",
        description: state.message,
      });
    }
  }, [state, toast]);

  return (
    <main className="flex min-h-[calc(100vh-112px)] flex-col items-center justify-start pt-20 px-4 bg-stone-50/30">
      
      <Card className="w-full max-w-md rounded-3xl shadow-lg border-stone-100">
        <CardHeader className="text-center pb-2">
          <div className="mx-auto bg-orange-100 p-3 rounded-full w-fit mb-4">
             <LockKeyhole className="h-6 w-6 text-orange-600" />
          </div>
          <CardTitle className="text-2xl text-stone-700">Nueva Contraseña</CardTitle>
          <CardDescription>
            Ingresa tu nueva contraseña para recuperar el acceso a tu cuenta.
          </CardDescription>
        </CardHeader>
        
        <form action={dispatch}>
          {/* Input oculto para pasar el token al Server Action */}
          <input type="hidden" name="token" value={params.token} />

          <CardContent className="space-y-4">
            
            {/* Campo Contraseña */}
            <div className="grid gap-2">
              <Label htmlFor="password" className="text-stone-700">Nueva Contraseña</Label>
              <div className="relative">
                <Input 
                    id="password" 
                    name="password" 
                    type={showPassword ? "text" : "password"} 
                    className="rounded-full pr-10" 
                    required 
                    minLength={8} 
                    placeholder="********"
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
              {state?.errors?.password && (
                <p className="text-xs text-red-500 ml-2">{state.errors.password[0]}</p>
              )}
            </div>

            {/* Campo Confirmar */}
            <div className="grid gap-2">
              <Label htmlFor="confirmPassword" className="text-stone-700">Confirmar Nueva Contraseña</Label>
              <Input 
                id="confirmPassword" 
                name="confirmPassword" 
                type={showPassword ? "text" : "password"} 
                className="rounded-full" 
                required 
                placeholder="********"
              />
              {state?.errors?.confirmPassword && (
                <p className="text-xs text-red-500 ml-2">{state.errors.confirmPassword[0]}</p>
              )}
            </div>
            
            {state?.errors?._form && (
              <div className="bg-red-50 border border-red-200 text-red-700 text-sm p-3 rounded-xl text-center">
                 ❌ {state.errors._form[0]}
              </div>
            )}

          </CardContent>
          
          <CardFooter className="flex flex-col gap-4 pt-2">
            <SubmitButton />
          </CardFooter>
        </form>
      </Card>
    </main>
  );
}