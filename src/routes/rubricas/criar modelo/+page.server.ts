import { redirect } from '@sveltejs/kit';
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
        course: Array(1).fill('#TAG'),
        major: Array(1).fill('#TAG'),
        uid,
        criteria: [
            { name: 'Critério 1', descriptors: Array(5).fill('') },
            { name: 'Critério 2', descriptors: Array(5).fill('') },
            { name: 'Critério 3', descriptors: Array(5).fill('') }
        ],
        performance_levels: [
            { name: 'Level 1', value: 1 },
            { name: 'Level 2', value: 2 },
            { name: 'Level 3', value: 3 },
            { name: 'Level 4', value: 4 },
            { name: 'Level 5', value: 5 }
        ],
        public: true,
        finished: false,
        in_edit: true,
        version: 0,
        original_model: ''
    };

    // Adiciona a rubrica ao Firestore
    const docRef = await addDoc(collection(db, 'rubrics'), blankRubric);
    const docId = docRef.id;

    return {
        docId
    };
};
