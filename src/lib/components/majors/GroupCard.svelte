<script lang="ts">
  import { writable } from "svelte/store";
  import { onMount } from "svelte";
  import { collection, query, where, getDocs, updateDoc, doc } from "firebase/firestore";
  import { db } from "$lib/firebase";
  import { t } from "svelte-i18n";
  import { groupStore } from "$lib/groupStore"; // Importe o store global
  //@ts-ignore
  import IoMdRemoveCircle from 'svelte-icons/io/IoMdRemoveCircle.svelte';

  export let gid_ref: string;
  export let group_id: string; // ID do grupo atual
  export let student_ids: string[] = []; // IDs dos alunos no grupo
  export let class_id: string; // ID da turma atual

  let studentsInGroup = writable<any[]>([]); // Armazena as informações dos alunos no grupo de forma reativa
  let searchQuery = ""; // Texto da barra de pesquisa
  let availableStudents: any[] = []; // Alunos que ainda não têm grupo, da turma específica
  let successMessage: string | null = null; // Mensagem de sucesso
  let refreshGroups = false; // Estado de atualização dos grupos
  let groups: any[] = []; // Armazena os grupos
  
  // Buscar grupos
  const fetchGroups = async () => {
    try {
      const groupsQuery = query(collection(db, "student_groups"));
      const groupsSnapshot = await getDocs(groupsQuery);
      groups = groupsSnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
    } catch (error) {
      console.error("Erro ao buscar grupos:", error);
    }
  };

  // Buscar alunos disponíveis (sem grupo)
  const fetchAvailableStudents = async () => {
    if (searchQuery.length >= 1) {
      try {
        // Busca todos os alunos da turma
        const studentsQuery = query(
          collection(db, "students"),
          where("classes", "array-contains", class_id)
        );

        const studentsSnapshot = await getDocs(studentsQuery);

        // Filtra os alunos que não estão em nenhum grupo
        const allStudentIdsInGroups = groups.flatMap((group) => group.student_ids);
        availableStudents = studentsSnapshot.docs
          .filter((doc) => !allStudentIdsInGroups.includes(doc.id)) // Alunos não presentes em nenhum grupo
          .filter((doc) =>
            doc.data().nome.toLowerCase().includes(searchQuery.toLowerCase())
          )
          .map((doc) => ({ id: doc.id, ...doc.data() }));
      } catch (error) {
        console.error("Erro ao buscar alunos disponíveis:", error);
      }
    } else {
      availableStudents = []; // Limpa a lista se a busca estiver vazia
    }
  };

  // Adicionar aluno ao grupo
  const addStudentToGroup = async (student_id: string) => {
    try {
      // Referência ao documento do grupo
      const groupDocRef = doc(db, "student_groups", gid_ref);

      // Atualizar a lista de student_ids no documento do grupo
      await updateDoc(groupDocRef, {
        student_ids: [...student_ids, student_id],
      });

      // Atualizar a lista local de estudantes no grupo
      student_ids = [...student_ids, student_id];
      availableStudents = availableStudents.filter(
        (student) => student.id !== student_id
      );

      // Exibe uma mensagem de sucesso
      successMessage = `Aluno adicionado ao grupo ${group_id}.`;
      setTimeout(() => (successMessage = null), 3000); // Remove a mensagem após 3 segundos

      // Recarregar os alunos no grupo
      await fetchStudentsInGroup();
    } catch (error) {
      console.error("Erro ao adicionar aluno ao grupo:", error);
    }
  };

  // Buscar os alunos já presentes no grupo
  const fetchStudentsInGroup = async () => {
    if (student_ids.length > 0) {
      const studentsQuery = query(
        collection(db, "students"),
        where("__name__", "in", student_ids)
      );

      const studentsSnapshot = await getDocs(studentsQuery);
      const students = studentsSnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      studentsInGroup.set(students); // Atualiza a lista reativa
    }
  };

  // Remover aluno do grupo
  const removeStudentFromGroup = async (student_id: string) => {
    try {
      // Referência ao documento do grupo
      const groupDocRef = doc(db, "student_groups", gid_ref);

      // Atualizar a lista de student_ids no documento do grupo (remover o student_id)
      await updateDoc(groupDocRef, {
        student_ids: student_ids.filter((id) => id !== student_id),
      });

      // Atualizar as listas locais
      student_ids = student_ids.filter((id) => id !== student_id);
      studentsInGroup.set($studentsInGroup.filter((student) => student.id !== student_id));

      // Exibe uma mensagem de sucesso
      successMessage = `Aluno removido do grupo ${group_id}.`;
      setTimeout(() => (successMessage = null), 3000); // Remove a mensagem após 3 segundos

      // Recarregar a lista de alunos disponíveis
      await fetchAvailableStudents();
    } catch (error) {
      console.error("Erro ao remover aluno do grupo:", error);
    }
  };

  fetchGroups().then(() => {
      fetchStudentsInGroup();
  });

  // Assinar o store global para atualizações
  groupStore.subscribe((state) => {
    if (state.refresh !== refreshGroups) {
      refreshGroups = state.refresh;
      fetchGroups().then(() => {
        fetchStudentsInGroup(); // Recarrega os alunos no grupo
        fetchAvailableStudents(); // Recarrega a lista de alunos disponíveis
      });
    }
  });

  // Chama a função ao montar o componente
  onMount(() => {
    fetchStudentsInGroup();
  });
</script>

<div class="p-4 rounded-lg shadow-md min-h-60 max-h-72 overflow-y-auto overflow-x-auto w-[26vw] bg-secondary-600 dark:bg-dark-secondary m-2">
  <div class="flex justify-between">
    <h3 class="text-md w-24 mt-2 font-bold">{group_id}</h3>
    <!-- Barra de pesquisa -->
    <input
      type="text"
      placeholder="{$t('search_students')}"
      class="w-full h-10 p-2 mt-1 ml-2 border border-slate-800 rounded dark:bg-dark-surface"
      bind:value={searchQuery}
      on:input={fetchAvailableStudents}
    />
  </div>
  <p class="text-sm mt-2">{$t("students")}: {student_ids.length}</p>

  <!-- Mensagem de sucesso -->
  {#if successMessage}
    <div class="bg-green-700 text-white p-2 rounded mb-2">
      {successMessage}
    </div>
  {/if}

  <!-- Lista de alunos no grupo -->
  {#if $studentsInGroup.length > 0}
    {#each $studentsInGroup as student}
      <div class="p-1 border-[1px] border-dark-tertiary border-collapse border-solid w-max-content dark:bg-dark-surface flex justify-between">
        {student.nome} {student.sobrenome}
        <button class="h-6 w-6 mr-2 text-primary-500" on:click={() => removeStudentFromGroup(student.id)}>
          <IoMdRemoveCircle/>
        </button>
      </div>
    {/each}
  {/if}

  <!-- Lista de alunos disponíveis -->
  {#if searchQuery.length >= 1 && availableStudents.length > 0}
    <ul class="mt-2 max-h-40 overflow-y-auto dark:bg-dark-surface rounded shadow">
      {#each availableStudents as student}
        <li
          class="p-2 cursor-pointer hover:bg-gray-200"
          on:click={() => addStudentToGroup(student.id)}
        >
          {student.nome} {student.sobrenome}
        </li>
      {/each}
    </ul>
  {/if}
</div>

<style>
  /* Adicione estilos personalizados, se necessário */
</style>