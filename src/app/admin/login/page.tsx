'use client';

import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { useFirebase } from '@/firebase';
import { GoogleAuthProvider, signInWithPopup, onAuthStateChanged, signOut } from 'firebase/auth';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2 } from 'lucide-react';

const ADMIN_EMAIL = 'rafael.nobre.d@gmail.com';

export default function AdminLoginPage() {
  const router = useRouter();
  const { auth } = useFirebase();

  const handleSignIn = async () => {
    if (!auth) return;
    const provider = new GoogleAuthProvider();
    try {
      const result = await signInWithPopup(auth, provider);
      // Após o login, a verificação será feita pelo AdminLayout
      if (result.user.email === ADMIN_EMAIL) {
        router.push('/admin');
      } else {
        // Se o e-mail não for o correto, desloga o usuário e mostra um erro
        await signOut(auth);
        alert('Acesso negado. Apenas o administrador pode entrar.');
      }
    } catch (error) {
      console.error("Erro ao fazer login com o Google:", error);
      alert('Ocorreu um erro durante o login. Tente novamente.');
    }
  };

  // Se o usuário já estiver logado com a conta certa, redireciona
  useEffect(() => {
    if (!auth) return;
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user && user.email === ADMIN_EMAIL) {
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
          <CardDescription>Faça login com a sua conta Google de administrador.</CardDescription>
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
