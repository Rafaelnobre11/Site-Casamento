'use client';

import { useEffect, useState } from 'react';
import { doc, onSnapshot, getDoc, type DocumentSnapshot } from 'firebase/firestore';
import { useFirestore } from '../provider';
import { DocumentData } from '../types';
import { errorEmitter } from '../error-emitter';
import { FirestorePermissionError } from '../errors';

type DocOptions = {
  listen?: boolean;
  initialData?: any;
};

export function useDoc<T = DocumentData>(
  path: string,
  options?: DocOptions
) {
  const firestore = useFirestore();
  const [data, setData] = useState<T | null>(options?.initialData ?? null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!firestore || !path) {
      setLoading(false);
      return;
    }

    const ref = doc(firestore, path);

    const handleSnapshot = (snapshot: DocumentSnapshot) => {
      if (snapshot.exists()) {
        const docData = { ...snapshot.data(), id: snapshot.id } as T;
        setData(docData);
      } else {
        setData(null);
      }
      // CRITICAL FIX: Ensure loading is set to false even if doc doesn't exist
      setLoading(false);
    };

    const handleError = (err: Error & { code?: string }) => {
      console.error(err);
      if (err.code === 'permission-denied') {
        errorEmitter.emit('permission-error', new FirestorePermissionError({path: ref.path, operation: 'get'}));
      }
      setError(err);
      setLoading(false);
    };

    if (options?.listen === false) {
      getDoc(ref).then(handleSnapshot).catch(handleError);
      return;
    }

    const unsubscribe = onSnapshot(ref, handleSnapshot, handleError);

    return () => unsubscribe();
  }, [firestore, path, options?.listen]);

  return { data, loading, error };
}
