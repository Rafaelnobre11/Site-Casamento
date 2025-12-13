'use client';

import { ReactNode } from 'react';
import { FirebaseProvider } from './provider'; // Importe o provedor consolidado

interface FirebaseClientProviderProps {
  children: ReactNode;
}

// A única responsabilidade deste componente é aplicar o FirebaseProvider.
export function FirebaseClientProvider({
  children,
}: FirebaseClientProviderProps) {
  return <FirebaseProvider>{children}</FirebaseProvider>;
}
