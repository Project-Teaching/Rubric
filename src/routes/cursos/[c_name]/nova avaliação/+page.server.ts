import { adminDB } from '$lib/server/admin';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ url, locals }) => {
  // Pegando os parâmetros da URL
  const class_id = url.searchParams.get('class_id');
  const rubric_model_id = url.searchParams.get('rubric_model_id') as string;
  const uid = locals.userID;

  // Se não houver class_id, retorne vazio (pode ser útil como fallback)
  if (!class_id) {
    return {
      class_id: null,
      rubric_model_id: null,
      uid: null
    };
  }

  const classDoc = await adminDB.collection('classes').doc(class_id).get();
  const rubricDoc = await adminDB.collection('rubrics').doc(rubric_model_id).get();
  const rubricData = rubricDoc.data();
  const classData = classDoc.data();

  if (!classData) {
    return { error: 'Classe não encontrada', class_id, rubric_model_id, uid };
  }

  const course_id = classData.course_id;

  if (course_id != null) {
    const majorsRef = adminDB.collection('majors');
    const snapshot = await majorsRef.get();
    let majorDoc = null;

    for (const doc of snapshot.docs) {
      const majorData = doc.data();
      const majorCourses = majorData.major_courses;

      const foundCourse = majorCourses.find((course: { c_id: string }) => course.c_id === course_id);

      if (foundCourse) {
        majorDoc = doc;
        break;
      }
    }

    if (majorDoc) {
      return {
        class_id,
        rubric_model_id,
        uid,
        major: majorDoc.data(),
        rubric: rubricData,
        class: classData
      };
    } else {
      return {
        class_id,
        rubric_model_id,
        uid,
        error: 'Curso não encontrado em nenhuma major',
        class: classData
      };
    }
  } else {
    return { error: 'course_id não encontrado na classe', class_id, rubric_model_id, uid };
  }
};
