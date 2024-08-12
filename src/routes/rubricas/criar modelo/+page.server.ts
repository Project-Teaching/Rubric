import type { PageServerLoad, Actions } from './$types';
import { adminDB } from '$lib/server/admin';
import { error, redirect } from '@sveltejs/kit';
import { addDoc, collection } from 'firebase/firestore';
import { db } from '$lib/firebase';

export const load = async ({ locals }) => {
    const uid = locals.userID;

    if (!uid) {
        throw redirect(302, '/'); // Redireciona para a página inicial se não estiver logado
    }

    // Cria uma rubrica em branco
    const blankRubric = {
        model_name: '',
        final_date: '',
        course: '',
        major: '',
        uid,
        criteria: [
            { name: 'Critério 1', descriptors: Array(4).fill('') },
            { name: 'Critério 2', descriptors: Array(4).fill('') },
            { name: 'Critério 3', descriptors: Array(4).fill('') }
        ],
        performance_levels: [
            { name: 'Level 1', value: 1 },
            { name: 'Level 2', value: 2 },
            { name: 'Level 3', value: 3 },
            { name: 'Level 4', value: 4 }
        ]
    };

    // Adiciona a rubrica ao Firestore
    const docRef = await addDoc(collection(db, 'rubrics'), blankRubric);
    const docId = docRef.id;

    return {
        docId
    };
};
