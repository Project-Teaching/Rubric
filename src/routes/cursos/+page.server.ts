import type { PageServerLoad } from './$types';
import { adminDB } from '$lib/server/admin';
import { redirect, error } from '@sveltejs/kit';

export const load: PageServerLoad = async ({ locals }) => {
    const uid = locals.userID;

    if (!uid) {
        throw redirect(302, '/'); // Redireciona para a página inicial se não estiver logado
    }

    try {
        // Filtra as disciplinas onde o usuário está listado como professor
        const classesSnapshot = await adminDB.collection('classes')
            .where('professors', 'array-contains', uid)
            .where('class_status', '==', true)
            .get();

        const classesData = classesSnapshot.docs.map(doc => ({
            id: doc.id,
            course_id: doc.data().course_id,
            course_semester: doc.data().course_semester,
            course_year: doc.data().course_year,
        }));

        // Carrega os cursos correspondentes aos course_id filtrados
        const majorsSnapshot = await adminDB.collection('majors').get();
        const majorsData = majorsSnapshot.docs.map(doc => {
            const major = doc.data();
            const filteredCourses = major.major_courses.filter((course: { c_id: any; }) => 
                classesData.some(cls => cls.course_id === course.c_id)
            );
            return {
                id: doc.id,
                major_name: major.major_name,
                major_courses: filteredCourses
            };
        }).filter(major => major.major_courses.length > 0); // Exclui majors sem cursos atribuídos

        return {
            majors: majorsData,
            classes: classesData
        };

    } catch (err) {
        console.error('Erro ao carregar cursos e disciplinas:', err);
        throw error(500, 'Erro ao carregar os cursos e disciplinas');
    }
};