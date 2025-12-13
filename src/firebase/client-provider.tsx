'use client';

import { ReactNode } from 'react';
import { FirebaseProvider } from './provider';

interface FirebaseClientProviderProps {
  children: ReactNode;
}

// Este componente agora apenas passa os filhos para o FirebaseProvider,
// que lida com toda a lógica de inicialização.
export function FirebaseClientProvider({
  children,
}: FirebaseClientProviderProps) {
  return <FirebaseProvider>{children}</FirebaseProvider>;
}
