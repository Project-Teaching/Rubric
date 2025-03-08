<script lang="ts">
    import { onMount } from "svelte";
    import { collection, query, where, getDocs, updateDoc, doc } from "firebase/firestore";
    import { db } from "$lib/firebase";
    import { t } from "svelte-i18n";
    import { groupStore } from "$lib/groupStore";

    export let class_id: string; // ID da turma atual
    export let groups: { id: string; group_id: string, student_ids: string[] }[] = []; // Lista de grupos
  
    let ungroupedStudents: any[] = []; // Alunos sem grupo
    let loading = true; // Estado de carregamento
    let successMessage: string | null = null; // Mensagem de sucesso
  
    function reloadPage() {
        window.location.reload();
    }

    // Buscar alunos sem grupo
    const fetchUngroupedStudents = async () => {
      try {
        // Busca todos os alunos da turma
        const studentsQuery = query(
          collection(db, "students"),
          where("classes", "array-contains", class_id)
        );
  
        const studentsSnapshot = await getDocs(studentsQuery);
  
        // Filtra os alunos que não estão em nenhum grupo
        const allStudentIdsInGroups = groups.flatMap((group) => group.student_ids);
        ungroupedStudents = studentsSnapshot.docs
          .filter((doc) => !allStudentIdsInGroups.includes(doc.id)) // Alunos não presentes em nenhum grupo
          .map((doc) => ({ id: doc.id, ...doc.data() }));
  
        loading = false;
      } catch (error) {
        console.error("Erro ao buscar alunos sem grupo:", error);
        loading = false;
      }
    };
  
    // Mover aluno para um grupo
    const moveStudentToGroup = async (studentId: string, groupId: string) => {
      try {
        // Atualiza a lista de student_ids no grupo
        const group = groups.find((g) => g.id === groupId);
        if (group) {
          const groupDocRef = doc(db, "student_groups", groupId);
          await updateDoc(groupDocRef, {
            student_ids: [...group.student_ids, studentId],
          });
  
          // Exibe uma mensagem de sucesso
          successMessage = `Aluno movido para o grupo ${group.group_id}.`;
          setTimeout(() => (successMessage = null), 3000); // Remove a mensagem após 3 segundos
          groupStore.update((state) => ({ ...state, refresh: !state.refresh }));

          // Recarrega a lista de alunos sem grupo
          await fetchUngroupedStudents();
          reloadPage();
        }
      } catch (error) {
        console.error("Erro ao mover aluno para o grupo:", error);
      }
    };
  
    // Carrega os alunos sem grupo ao montar o componente
    onMount(() => {
      fetchUngroupedStudents();
    });
  </script>
  
  <div class="p-4 rounded-lg shadow-md min-h-60 max-h-72 overflow-y-auto overflow-x-auto w-[26vw] bg-secondary-600 dark:bg-dark-secondary m-2">
    <h3 class="text-md w-24 mt-2 font-bold">Alunos Sem Grupo</h3>
  
    <!-- Mensagem de sucesso -->
    {#if successMessage}
      <div class="bg-green-700 text-white p-2 rounded mb-2">
        {successMessage}
      </div>
    {/if}
  
    {#if loading}
      <p>Carregando...</p>
    {:else if ungroupedStudents.length > 0}
      <ul class="mt-2 max-h-40 overflow-y-auto dark:bg-dark-surface rounded shadow">
        {#each ungroupedStudents as student}
          <li class="p-2 flex justify-between items-center">
            <span>{student.nome} {student.sobrenome}</span>
            {#if groups.length > 0}
              <select
                class="p-1 border border-slate-800 rounded dark:bg-dark-surface"
                on:change={(e) => moveStudentToGroup(student.id, e.target.value)}
              >
                <option value="">Mover para...</option>
                {#each groups as group}
                  <option value={group.id}>{group.group_id}</option>
                {/each}
              </select>
            {/if}
          </li>
        {/each}
      </ul>
    {:else}
      <p>Nenhum aluno sem grupo.</p>
    {/if}
  </div>
  
  <style>
    /* Adicione estilos personalizados, se necessário */
  </style>