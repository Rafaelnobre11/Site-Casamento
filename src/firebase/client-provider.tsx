'use client';

import { ReactNode, useState, useEffect } from 'react';
import { FirebaseProvider } from './provider';
import { initializeFirebase } from './config';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import type { FirebaseApp } from 'firebase/app';
import type { Auth } from 'firebase/auth';
import type { Firestore } from 'firebase/firestore';

interface FirebaseClientProviderProps {
  children: ReactNode;
}

interface FirebaseInstances {
  app: FirebaseApp;
  auth: Auth;
  firestore: Firestore;
}

// Este componente garante que a inicialização do Firebase só aconteça no lado do cliente.
export function FirebaseClientProvider({
  children,
}: FirebaseClientProviderProps) {
  const [firebase, setFirebase] = useState<FirebaseInstances | null>(null);

  useEffect(() => {
    // A inicialização é feita aqui, dentro do useEffect,
    // garantindo que só roda no navegador.
    const app = initializeFirebase();
    const auth = getAuth(app);
    const firestore = getFirestore(app);
    setFirebase({ app, auth, firestore });
  }, []);

  // Enquanto o Firebase não for inicializado, não renderizamos nada
  // para evitar erros nos componentes filhos que dependem dele.
  if (!firebase) {
    return null; 
  }

  return (
    <FirebaseProvider app={firebase.app} auth={firebase.auth} firestore={firebase.firestore}>
      {children}
    </FirebaseProvider>
  );
}
