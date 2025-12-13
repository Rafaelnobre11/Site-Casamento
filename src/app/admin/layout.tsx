'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useUser } from '@/firebase';
import { Loader2 } from 'lucide-react';
import { signOut } from 'firebase/auth';
import { useFirebase } from '@/firebase/provider';
import LoginDialog from '@/components/admin/LoginDialog';

const ADMIN_EMAIL = 'rafael.nobre.d@gmail.com';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { user, loading } = useUser();
  const { auth } = useFirebase();
  const [isLoginOpen, setLoginOpen] = useState(true);

  useEffect(() => {
    if (!loading) {
      if (!user) {
        setLoginOpen(true);
      } else if (user.email === ADMIN_EMAIL) {
        setLoginOpen(false);
      } else {
        if (auth) {
            signOut(auth);
        }
        setLoginOpen(true);
      }
    }
  }, [user, loading, auth]);

  if (loading) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-muted/40">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
        <p className="ml-4 text-muted-foreground">Verificando acesso...</p>
      </div>
    );
  }
  
  const handleLoginSuccess = () => {
    setLoginOpen(false);
  }

  // Renderização condicional segura.
  // O conteúdo do painel (children) só é renderizado se o login for bem-sucedido.
  if (isLoginOpen) {
    return (
        <div className="h-screen w-full bg-muted/40">
            <LoginDialog isOpen={isLoginOpen} onLoginSuccess={handleLoginSuccess} />
        </div>
    );
  }

  return <>{children}</>;
}
