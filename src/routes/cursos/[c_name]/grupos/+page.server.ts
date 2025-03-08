import type { PageServerLoad } from './$types';
import { adminDB } from '$lib/server/admin';
import type { Actions } from '@sveltejs/kit';

export const load: PageServerLoad = async ({ locals, url, params }) => {
  const course_name = params.c_name; // Pega o nome da disciplina da URL
  const class_id = url.searchParams.get('class_id'); // Pega o class_id da URL, se necessário
  const uid = locals.userID; // ID do professor logado

  if (class_id) {
    // Obtenha o documento da turma pelo class_id
    const classDoc = await adminDB.collection('classes').doc(class_id).get();

    if (classDoc.exists) {
      const classData = classDoc.data();

      // Verifica se o professor está autorizado
      if (classData?.professors && classData.professors.includes(uid)) {
        // Carrega os dados dos estudantes na turma
        const studentIDs = classData.students || [];
        const studentDataPromises = studentIDs.map((studentID: string) =>
          adminDB.collection('students').doc(studentID).get()
        );
        const studentDocs = await Promise.all(studentDataPromises);

        const studentsData = studentDocs
          .map((doc) => {
            if (doc.exists) {
              const data = doc.data();
              // Medida temporária: remove aspas do sobrenome
              if (data.sobrenome) {
                data.sobrenome = data.sobrenome.replace(/^"(.*)"$/, '$1');
              }
              return { id: doc.id, ...data };
            }
            return null;
          })
          .filter((student) => student !== null); // Remove estudantes inexistentes

        // Carrega os grupos associados à turma
        const groupsSnapshot = await adminDB
          .collection('student_groups')
          .where('class_id', '==', class_id)
          .orderBy('group_id', 'asc')
          .get();

        const groupsData = groupsSnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));

        return {
          classes: classData,
          course_name,
          class_id,
          students: studentsData,
          groups: groupsData, // Adiciona os grupos na resposta
          professorId: uid,
        };
      } else {
        console.log('O professor não está designado para a turma especificada.');
      }
    } else {
      console.log('Nenhuma turma encontrada para o class_id fornecido.');
    }
  } else {
    console.log('class_id não encontrado no Params da página.');
  }
};


export const actions: Actions = {
  createGroup: async ({ request }) => {
    const formData = await request.formData();
    const class_id = formData.get('class_id') as string;

    if (!class_id) {
      return { success: false, message: 'Class ID não fornecido.' };
    }

    try {
      // Buscar todos os grupos já existentes nessa turma
      const groupsSnapshot = await adminDB
            .collection('student_groups')
            .where('class_id', '==', class_id)
            .get();
    
      // Contar os grupos existentes
      const existingGroups = groupsSnapshot.docs.length;
    
      // Gerar o próximo group_id
      const nextGroupId = `Grupo ${existingGroups + 1}`;

      // Cria uma entrada vazia no documento student_groups
      const studentGroupsRef = adminDB.collection('student_groups');
      await studentGroupsRef.add({
        class_id,
        group_id: nextGroupId,
        student_ids: [], // Nenhum grupo adicionado inicialmente
      });

      return { success: true, message: 'Novo grupo criado com sucesso!' };
    } catch (error) {
      console.error('Erro ao criar novo grupo:', error);
      return { success: false, message: 'Erro ao criar novo grupo. Tente novamente.' };
    }
  },
};