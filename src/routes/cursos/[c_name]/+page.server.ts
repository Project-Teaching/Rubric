import type { PageServerLoad } from './$types';
import { adminDB } from '$lib/server/admin';
import { Timestamp } from 'firebase-admin/firestore';
import type { Actions } from '@sveltejs/kit';

export const load: PageServerLoad = async ({ locals, url, params }) => {
  const course_name = params.c_name;  // Pega o nome da disciplina da URL
  const class_id = url.searchParams.get('class_id'); // Recupera o class_id da URL
  const uid = locals.userID;

  if (class_id) {
    const classDoc = await adminDB.collection('classes').doc(class_id).get();

    // Verifica se o documento existe
    if (classDoc.exists) {
        //console.log(classDoc.id, '=>', classDoc.data());
        const classData = classDoc.data();

        const evaluationsSnapshot = await adminDB.collection('evaluations')
        .where('class_id', '==', class_id)
        .where('professor_id', '==', uid)
        .get();

        const evaluationsData = evaluationsSnapshot.docs.map(doc => {
        const data = doc.data();
      
        // Converte o evaluation_date para uma string ISO, se for um Timestamp
        const evaluation_date = (data.evaluation_date instanceof Timestamp)
              ? data.evaluation_date.toDate().toLocaleDateString('pt-BR')  // Converte para string serializável
              : data.evaluation_date;
      
        return { 
              id: doc.id, 
              ...data,
              evaluation_date // Garantindo que este campo seja serializável
          };
        });

        const rubricsSnapshot = await adminDB.collection('rubrics')
        .where('uid', '==', uid)
        .get();

        const rubricsData = rubricsSnapshot.docs.map(doc => {
            const data = doc.data();
            return { 
                rubric_id: doc.id, 
                model_name: data.model_name,
                version: data.version
            };
        });

        return {
            course_name,
            classes: classData,
            evaluations: evaluationsData,
            models: rubricsData,
            class_id
        };
    } else {
        console.log('Nenhuma turma encontrada para o class_id fornecido.');
    }
  } else {
        console.log('class_id não encontrado no Params da página.');
  }
};

export const actions: Actions = {
  default: async ({ request, locals }) => {
    const formData = await request.formData();

    const class_id = formData.get('class_id') as string;
    const rubric_model_id = formData.get('rubric_model_id') as string;
    const professor_id = formData.get('professor_id') as string;
    const evaluation_name = formData.get('evaluation_name') as string;

    const evaluation_date_input = formData.get('evaluation_date') as string;
    const evaluation_date = new Date(evaluation_date_input); // Converte para Date

    // Verifica se a data é válida
    if (isNaN(evaluation_date.getTime())) {
        return {
            success: false,
            message: 'Data inválida. Tente novamente.',
        };
    }

    // Ajusta a data para UTC
    const evaluation_date_utc = new Date(
        evaluation_date.getUTCFullYear(),
        evaluation_date.getUTCMonth(),
        evaluation_date.getUTCDate(),
        23, // Horas
        55, // Minutos
        0 // Segundos
    );

    const evaluation_major = formData.get('evaluation_major') as string;
    const evaluation_course = formData.get('evaluation_course') as string;

    try {
      // Salvar a avaliação no banco de dados
      const newEvaluation = {
        class_id,
        rubric_model_id,
        professor_id,
        evaluation_name,
        evaluation_date: evaluation_date_utc,
        evaluation_major,
        evaluation_course,
        evaluation_result: [
            { evaluation_comments: '', evaluation_notes: '', group_id: '', student_id: '', score: 0 },
        ]
      };

      // Exemplo de salvamento no Firestore
      const evaluationsRef = adminDB.collection('evaluations');
      await evaluationsRef.add(newEvaluation);

      // Retorna um sucesso
      return {
        success: true,
        message: 'Avaliação criada com sucesso!',
      };
    } catch (error) {
      console.error('Erro ao criar avaliação:', error);
      return {
        success: false,
        message: 'Erro ao criar avaliação. Tente novamente.',
      };
    }
  }
};