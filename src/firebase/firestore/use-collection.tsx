'use client';

import { useEffect, useState } from 'react';
import {
  collection,
  onSnapshot,
  type Query,
  query,
  queryEqual,
  where,
  getDocsFromServer,
  type QuerySnapshot,
} from 'firebase/firestore';

import { useFirebase } from '../provider';
import { DocumentData } from '../types';
import { errorEmitter } from '../error-emitter';
import { FirestorePermissionError } from '../errors';

type CollectionOptions<T> = {
  where?: [string, '==', string];
  initialData?: T[];
};

export function useCollection<T = DocumentData>(
  path: string,
  options?: CollectionOptions<T>
) {
  const { firestore } = useFirebase();

  const [data, setData] = useState<T[]>(options?.initialData ?? []);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!firestore) {
      return;
    }

    let q: Query;
    const ref = collection(firestore, path);

    if (options?.where) {
      q = query(ref, where(...options.where));
    } else {
      q = query(ref);
    }

    const unsubscribe = onSnapshot(
      q,
      { includeMetadataChanges: true },
      (snapshot) => {
        if (snapshot.metadata.fromCache && data.length > 0) {
          return;
        }

        const docs = snapshot.docs.map((doc) => ({
          ...doc.data(),
          id: doc.id,
        })) as T[];

        setData(docs);
        setLoading(false);
      },
      (err) => {
        console.error(err);
        if (err.code === 'permission-denied') {
          errorEmitter.emit('permission-error', new FirestorePermissionError({path: ref.path, operation: 'list'}));
        }
        setError(err);
      }
    );

    return () => unsubscribe();
  }, [firestore, path, options?.where]);

  return { data, loading, error };
}
