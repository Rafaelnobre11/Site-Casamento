'use client';

import { createContext, useContext, ReactNode } from 'react';
import { FirebaseApp } from 'firebase/app';
import { Auth } from 'firebase/auth';
import { Firestore } from 'firebase/firestore';
import { initializeFirebase } from './config';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

// 1. A inicialização acontece aqui, de forma síncrona e imediata.
const app = initializeFirebase();
const auth = getAuth(app);
const firestore = getFirestore(app);

// 2. O tipo de valor do contexto é definido.
interface FirebaseContextValue {
  app: FirebaseApp | null;
  auth: Auth | null;
  firestore: Firestore | null;
}

// 3. O contexto é criado, mas não exportado diretamente.
const FirebaseContext = createContext<FirebaseContextValue | undefined>(
  undefined
);

interface FirebaseProviderProps {
  children: ReactNode;
}

// 4. O Provedor é o componente que você usará no layout.
// Ele simplesmente fornece os serviços já inicializados.
export function FirebaseProvider({ children }: FirebaseProviderProps) {
  const value = { app, auth, firestore };

  return (
    <FirebaseContext.Provider value={value}>
      {children}
    </FirebaseContext.Provider>
  );
}

// 5. O hook `useFirebase` é a forma como os componentes acessarão os serviços.
export function useFirebase() {
  const context = useContext(FirebaseContext);

  if (context === undefined) {
    throw new Error('useFirebase must be used within a FirebaseProvider');
  }

  return context;
}
