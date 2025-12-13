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
        // Se não há usuário, o modal de login deve estar aberto.
        setLoginOpen(true);
      } else if (user.email === ADMIN_EMAIL) {
        // Se o usuário é o admin, fecha o modal.
        setLoginOpen(false);
      } else {
        // Se é um usuário logado mas não é o admin, desloga e abre o modal.
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

  return (
    <>
      <LoginDialog isOpen={isLoginOpen} onLoginSuccess={handleLoginSuccess} />
      <div className={isLoginOpen ? 'blur-sm pointer-events-none' : ''}>
        {children}
      </div>
    </>
  );
}
