import { adminDB } from '$lib/server/admin';
import type { Actions } from '@sveltejs/kit';

export const actions: Actions = {
    default: async ({ request, locals }) => {
        const formData = await request.formData();
        const class_id = formData.get('class_id');
        const rubric_model_id = formData.get('rubric_model_id');
        const uid = locals.userID; // Supondo que você tenha o uid no locals
    
        // Você pode retornar diretamente os valores que deseja
        return {
          success: true,
          class_id,
          rubric_model_id,
          uid
        };
      }
    };
