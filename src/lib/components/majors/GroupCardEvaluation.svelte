<script lang="ts">
    import { writable } from "svelte/store";
    import { onMount } from "svelte";
    import { collection, query, where, getDocs, updateDoc, doc } from "firebase/firestore";
    import { db } from "$lib/firebase";
    import { t } from "svelte-i18n";
    //@ts-ignore
    import IoMdRemoveCircle from 'svelte-icons/io/IoMdRemoveCircle.svelte'
  
    export let gid_ref: string;
    export let group_id: string; // ID do grupo atual
    export let student_ids: string[] = []; // IDs dos alunos no grupo
    export let class_id: string; // ID da turma atual
  
    let studentsInGroup = writable<any[]>([]); // Armazena as informações dos alunos no grupo de forma reativa
    let searchQuery = ""; // Texto da barra de pesquisa
    let availableStudents: any[] = []; // Alunos que ainda não têm grupo, da turma específica
  
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
  
    // Chama a função ao montar o componente
    onMount(() => {
      fetchStudentsInGroup();
    });
  </script>
  
    <!-- Lista de alunos no grupo -->
    {#if $studentsInGroup.length > 0}
      {#each $studentsInGroup as student}
            <div class="p-1 border-[1px] border-dark-tertiary border-collapse border-solid w-max-content dark:bg-dark-surface flex justify-between">{student.nome} {student.sobrenome} </div>
      {/each}
    {/if}
    <!-- Lista de alunos disponíveis -->
    {#if availableStudents.length > 0}
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
  
  <style>
    /* Adicione estilos personalizados, se necessário */
  </style>
  