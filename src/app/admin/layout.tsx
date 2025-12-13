'use client';

// Este layout agora simplesmente renderiza os seus filhos sem qualquer verificação de autenticação.
export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
