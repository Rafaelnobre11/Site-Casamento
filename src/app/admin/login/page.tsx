'use client';

import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { useFirebase } from '@/firebase';
import { GoogleAuthProvider, signInWithPopup, onAuthStateChanged } from 'firebase/auth';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2 } from 'lucide-react';

export default function AdminLoginPage() {
  const router = useRouter();
  const { auth } = useFirebase();

  const handleSignIn = async () => {
    if (!auth) return;
    const provider = new GoogleAuthProvider();
    try {
      await signInWithPopup(auth, provider);
      router.push('/admin');
    } catch (error) {
      console.error("Erro ao fazer login com o Google:", error);
    }
  };

  // Redireciona se o usuário já estiver logado
  useEffect(() => {
    if (!auth) return;
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        router.push('/admin');
      }
    });
    return () => unsubscribe();
  }, [auth, router]);
  
  if (!auth) {
      return (
         <div className="flex h-screen w-full flex-col items-center justify-center bg-muted/40">
            <Loader2 className="h-12 w-12 animate-spin text-primary" />
            <p className="mt-4 text-lg text-muted-foreground">Carregando...</p>
        </div>
      )
  }

  return (
    <div className="flex h-screen w-full flex-col items-center justify-center bg-muted/40 p-4">
      <Card className="w-full max-w-sm">
        <CardHeader className="text-center">
          <CardTitle className="font-headline text-2xl">Acesso ao Painel</CardTitle>
          <CardDescription>Faça login para gerenciar o site do seu casamento.</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col items-center gap-4">
          <Button onClick={handleSignIn} className="w-full">
            Entrar com Google
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
