'use client';

import { type User, onIdTokenChanged } from 'firebase/auth';
import { useEffect, useState } from 'react';
import { useFirebase } from '../provider.tsx';

export type FirebaseUser = User | null;

export function useUser() {
  const { auth } = useFirebase();
  const [user, setUser] = useState<FirebaseUser>(() => auth?.currentUser ?? null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!auth) {
      setLoading(false);
      setUser(null);
      return;
    }

    const unsubscribe = onIdTokenChanged(auth, (firebaseUser: FirebaseUser) => {
      setUser(firebaseUser);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [auth]);

  return { user, loading };
}
