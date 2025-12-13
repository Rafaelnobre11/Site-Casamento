'use client';

import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { useUser } from '@/firebase';
import { Loader2 } from 'lucide-react';

const ADMIN_EMAIL = 'rafael.nobre.d@gmail.com';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { user, loading } = useUser();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.push('/admin/login');
    }
  }, [user, loading, router]);

  if (loading) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-muted/40">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
        <p className="ml-4 text-muted-foreground">Verificando acesso...</p>
      </div>
    );
  }

  if (user && user.email === ADMIN_EMAIL) {
    return <>{children}</>;
  }
  
  if (user && user.email !== ADMIN_EMAIL) {
     router.push('/admin/login');
     return (
        <div className="flex h-screen w-full items-center justify-center bg-muted/40 text-center p-4">
            <div>
                <h1 className="text-2xl font-bold text-destructive">Acesso Negado</h1>
                <p className="text-muted-foreground mt-2">
                    Este painel é restrito. Você será redirecionado para a página de login.
                </p>
            </div>
        </div>
    );
  }

  // Fallback em caso de race conditions, redireciona para login.
  return null;
}
