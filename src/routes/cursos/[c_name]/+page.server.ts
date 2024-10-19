import type { PageServerLoad } from './$types';
import { adminDB } from '$lib/server/admin';
import { Timestamp } from 'firebase-admin/firestore';

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
                model_name: data.model_name
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
