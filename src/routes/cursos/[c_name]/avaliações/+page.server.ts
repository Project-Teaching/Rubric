import type { PageServerLoad } from './$types';
import { adminDB } from '$lib/server/admin';
import { Timestamp } from 'firebase-admin/firestore';
import type { Actions } from '@sveltejs/kit';

export const load: PageServerLoad = async ({ locals, url, params }) => {
  const course_name = params.c_name;  // Pega o nome da disciplina da URL
  // Recuperar os dados de sessionStorage
  const class_id = url.searchParams.get('class_id');  // A URL pode ter o class_id, se necessário
  const evaluation_id = url.searchParams.get('evaluation_id');  // A URL pode ter o evaluation_id, se necessário

  const uid = locals.userID;

  if (class_id) {
    // Obtenha o documento da turma pelo class_id
    const classDoc = await adminDB.collection('classes').doc(class_id).get();

    // Verifica se o documento da turma existe
    if (classDoc.exists) {
      const classData = classDoc.data();

      // Verifica se o professor está na lista de professores da turma
      if (classData?.professors && classData?.professors.includes(uid)) {
        // Carrega os dados de cada estudante na turma
        const studentIDs = classData.students || [];
        const studentDataPromises = studentIDs.map((studentID: string) => 
          adminDB.collection('students').doc(studentID).get()
        );
        const studentDocs = await Promise.all(studentDataPromises);

        // Extrai os dados de cada estudante
        const studentsData = studentDocs.map(doc => {
          if (doc.exists) {
            const data = doc.data();
            return { id: doc.id, ...data };
          } else {
            return null; // Caso o documento do estudante não exista
          }
        }).filter(student => student !== null); // Remove estudantes que não existem

        if (evaluation_id) {  
          const evaluationDoc = await adminDB.collection('evaluations').doc(evaluation_id).get();

          if (evaluationDoc.exists) { 
            const data = evaluationDoc.data();

            // Converte o evaluation_date para uma string formatada, se for um Timestamp
            const evaluation_date = (data?.evaluation_date instanceof Timestamp)
              ? data.evaluation_date.toDate().toLocaleDateString('pt-BR') // Converte para string formatada
              : data?.evaluation_date;

            // Retorna os dados processados
            const evaluationData = { 
              id: evaluationDoc.id, 
              rubric_model_id: data?.rubric_model_id,
              ...data,
              evaluation_date // Garantindo que este campo seja serializável
            };

            const rubricModel = await adminDB.collection('rubrics').doc(evaluationData.rubric_model_id).get();
            const rubricData = {
              id: rubricModel.id,
              ...rubricModel.data()
            }
            return {
              classes: classData,
              course_name,
              class_id,
              students: studentsData,
              evaluation: evaluationData,
              rubricModel: rubricData, // Modelos de rubricas para as avaliações
            };
          }
          else {
            console.log('Nenhuma avaliação encontrada para o evaluation_id fornecido.');
          }
        }
        else {
           console.log('Evaluation_id não encontrado.');
        }
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
  // Ações para lidar com a avaliação de cada aluno (para ser implementado depois)
  default: async ({ request, locals }) => {
    const formData = await request.formData();

    const student_id = formData.get('student_id') as string;
    const rubric_model_id = formData.get('rubric_model_id') as string;
    const score = Number(formData.get('score') as unknown); // Nota para o aluno
    const evaluation_comments = formData.get('evaluation_comments') as string; // Comentários sobre a avaliação

    try {
      // Salvar a avaliação no banco de dados
      const newEvaluationResult = {
        student_id,
        rubric_model_id,
        score,
        evaluation_comments,
        professor_id: locals.userID,
      };

      // Exemplo de salvamento no Firestore (usando uma coleção de resultados de avaliação)
      const evaluationResultsRef = adminDB.collection('evaluation_results');
      await evaluationResultsRef.add(newEvaluationResult);

      return {
        success: true,
        message: 'Avaliação salva com sucesso!',
      };
    } catch (error) {
      console.error('Erro ao salvar a avaliação:', error);
      return {
        success: false,
        message: 'Erro ao salvar a avaliação. Tente novamente.',
      };
    }
  }
};
