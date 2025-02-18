import type { PageServerLoad } from "./$types";
import { adminDB } from "$lib/server/admin";
import { redirect, error } from "@sveltejs/kit";

export const load: PageServerLoad = async ({ locals }) => {
  const uid = locals.userID;

  if (!uid) {
    throw redirect(302, "/"); // Redireciona para a página inicial se não estiver logado
  }

  try {
    // Carrega todas as rubricas do usuário
    const rubricasSnapshot = await adminDB
      .collection("rubrics")
      .where("uid", "==", uid)
      .orderBy("version", "desc")
      .get();

    const rubricasData = rubricasSnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })) as Array<{ id: string; finished: boolean; in_edit: boolean }>;

    // Filtra as rubricas finalizadas e as rubricas em edição
    const rubricas = rubricasData.filter((rubrica) => rubrica.finished && !rubrica.in_edit);
    const editingRubricas = rubricasData.filter((rubrica) => !rubrica.finished && rubrica.in_edit);

    return {
      rubricas,
      editingRubricas,
    };
  } catch (err) {
    console.error("Erro ao carregar rubricas:", err);
    throw error(500, "Erro ao carregar os modelos de rubricas");
  }
};