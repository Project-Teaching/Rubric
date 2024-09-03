import { doc, getDoc } from "firebase/firestore";
import type { PageLoad } from './$types';
import { db } from '$lib/firebase';
import { error } from '@sveltejs/kit';

export const load: PageLoad = async ({ params }) => {
  const { id } = params;

  // Obtém o documento da rubrica com o ID fornecido
  const docRef = doc(db, 'rubrics', id);
  const docSnap = await getDoc(docRef);

  if (!docSnap.exists()) {
    throw error(404, "Rubrica não encontrada!");
  }

  const data = docSnap.data();

  return {
    docId: id,
    ...data
  };
};
