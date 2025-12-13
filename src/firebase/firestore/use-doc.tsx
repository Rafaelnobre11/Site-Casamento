'use client';

import { useEffect, useState } from 'react';
import { doc, onSnapshot, getDoc, type DocumentSnapshot } from 'firebase/firestore';
import { useFirestore } from '../provider'; // Alterado para usar o hook dedicado
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
  const firestore = useFirestore(); // Usa o hook para obter o firestore
  const [data, setData] = useState<T | null>(options?.initialData ?? null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!firestore || !path) {
      setLoading(false);
      return;
    }

    const ref = doc(firestore, path);

    const handleSnapshot = (snapshot: DocumentSnapshot<DocumentData>) => {
      if (snapshot.exists()) {
        const docData = { ...snapshot.data(), id: snapshot.id } as T;
        setData(docData);
      } else {
        // Se o documento não existe, define data como null e para de carregar.
        // Isto é crucial para que a página admin renderize com os dados padrão.
        setData(null);
      }
      setLoading(false);
    };

    const handleError = (err: Error & { code?: string }) => {
      console.error(err);
      if (err.code === 'permission-denied') {
         // O tipo de erro estava incorreto, corrigido para 'permission-error'
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
  // A dependência de firestore é importante para re-executar o efeito quando ele estiver disponível.
  }, [firestore, path, options?.listen]);

  return { data, loading, error };
}
