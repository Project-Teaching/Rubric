import type { PageServerLoad } from './$types';
import { adminDB } from '$lib/server/admin';
import { redirect, error } from '@sveltejs/kit';

export const load: PageServerLoad = async ({ locals }) => {
    const uid = locals.userID;

    if (!uid) {
        throw redirect(302, '/'); // Redireciona para a página inicial se não estiver logado
    }

    try {
        // Carrega os modelos de rubricas do usuário
        const rubricasSnapshot = await adminDB.collection('rubrics').where('uid', '==', uid).get();
        const rubricasData = rubricasSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        return {
            rubricas: rubricasData
        };
    } catch (err) {
        console.error('Erro ao carregar rubricas:', err);
        throw error(500, 'Erro ao carregar os modelos de rubricas');
    }
};