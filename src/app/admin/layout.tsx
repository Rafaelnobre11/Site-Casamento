'use client';

import { useEffect } from 'react';
import { useUser } from '@/firebase/auth/use-user';
import { useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { user, loading } = useUser();
  const router = useRouter();

  useEffect(() => {
    // Se o carregamento terminar e não houver usuário, redirecione para o login.
    if (!loading && !user) {
      router.replace('/admin/login');
    }
  }, [user, loading, router]);

  // Mostre o loader APENAS enquanto a verificação de autenticação estiver em andamento.
  if (loading) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-background">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
        <p className="ml-4 text-muted-foreground">Verificando acesso...</p>
      </div>
    );
  }

  // Se houver um usuário, renderize o conteúdo do administrador.
  if (user) {
    return <>{children}</>;
  }

  // Se não houver usuário, o useEffect cuidará do redirecionamento.
  // Retorne nulo para não renderizar nada enquanto isso acontece.
  return null;
}
