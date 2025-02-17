<script lang="ts">
  import { page } from '$app/stores';
  import Breadcrumbs from '$lib/components/Breadcrumbs.svelte';
  import Footer from '$lib/components/Footer.svelte';
  import NavBar from '$lib/components/NavBar.svelte';
  import Drawer from '$lib/components/Drawer.svelte';
  import { goto } from '$app/navigation';
  // @ts-ignore
  import FaRegListAlt from 'svelte-icons/fa/FaRegListAlt.svelte'
  // @ts-ignore
  import FaEye from 'svelte-icons/fa/FaEye.svelte'
  // @ts-ignore
  import FaTrashAlt from 'svelte-icons/fa/FaTrashAlt.svelte'
  // @ts-ignore
  import GroupModalRubric from '$lib/components/rubric/GroupModalRubric.svelte';
  import { t } from 'svelte-i18n';
  import { enhance } from '$app/forms';
  import GroupCardEvaluation from '$lib/components/majors/GroupCardEvaluation.svelte';
  import EGModalRubric from '$lib/components/rubric/EGModalRubric.svelte';

  let classes: { 
        course_id: string, course_semester: number, course_year: number, professors: any[], students: any[]
      };
  let evaluation: { 
        id: string, evaluation_id: string, evaluation_name: string, evaluation_date: string, evaluation_major: string, evaluation_course: string, class_id: string, professor_id: any[], rubric_model_id: string, evaluation_result: evaluation_results[]
      };
  let rubricModel: {
        id: string, model_name: string, version: number
  };
  let students: {
     id: string, email: string, nome: string, matricula: string, sobrenome: string
  }[];

  interface evaluation_results {
    evaluation_comment: string, evaluation_notes: string, groupd_id: string, student_id: string, score: number
  }   

  let course_name: string;
  let class_id: string;
  let professorId: string;
  let currentGroup: { group_id: string, student_ids: string[], group_name: string} | null = null;
  let groups: { id: string; group_id: string, student_ids: string[] }[] = [];

  function openModalRubric(group_id: string, student_ids: string[], group_name: string) {
    currentGroup = { group_id, student_ids, group_name };
    const modal = document.getElementById('rubricModal');
    if (modal) {
      // @ts-ignore
      modal.showModal();
    }
  }
  
  function closeModalRubric() {
    currentGroup = null;
    const modal = document.getElementById('rubricModal');
    if (modal) {
      // @ts-ignore
      modal.close();
    }
    reloadPage();
  }

  function openEGModalRubric(group_id: string, student_ids: string[], group_name: string) {
    currentGroup = { group_id, student_ids, group_name };
    const modal = document.getElementById('EGrubricModal');
    if (modal) {
      // @ts-ignore
      modal.showModal();
    }
  }
  
  function closeEGModalRubric() {
    currentGroup = null;
    const modal = document.getElementById('EGrubricModal');
    if (modal) {
      // @ts-ignore
      modal.close();
    }
    reloadPage();
  }

  function reloadPage() {
    window.location.reload();
  }

  function getStudentStatus(studentId: string) {
    const result = evaluation.evaluation_result.find((result) => result.student_id === studentId);
    if (result) {
      return 'Avaliado';
    }
    return 'Não avaliado';
  }

  function isGroupEvaluated(group: { student_ids: string[] }) {
    return group.student_ids.some(studentId => 
      evaluation.evaluation_result.some(result => result.student_id === studentId)
    );
  }

  $: {
    if ($page.data) {
      classes = $page.data.classes; // Acesse o objeto classes diretamente
      course_name = $page.data.course_name; // Acesse course_name diretamente
      evaluation = $page.data.evaluation; // Acesse evaluations diretamente
      rubricModel = $page.data.rubricModel; // Acesse rubric models diretamente
      students = $page.data.students; // Acesse students diretamente
      class_id = $page.data.class_id; // Acesse o class_id diretamente
      professorId = $page.data.professorId; // Acesse o professorId diretamente
      groups = $page.data.groups; // Acesse o objeto groups diretamente
    }
  }

</script>


<svelte:head>
  <title>Rubric Pro</title>
</svelte:head>

      <main class="flex flex-col min-h-screen dark:bg-dark-surface">
        <NavBar></NavBar>
        <Breadcrumbs />
        <div class="flex-grow main-content">
          <div class="drawer w-4/5">
            <input id="my-drawer" type="checkbox" class="drawer-toggle" />
            <div class="drawer-content">
              <!-- Conteúdo principal aqui -->
              <div class="h-2 flex justify-center text-center"> <!-- Bloco de Texto Principal 1 -->
                <h1 class="text-2xl font-bold text-primary-400"> Avaliação em Grupo</h1>
              </div>
              <div class="h-2 flex justify-center text-center"> <!-- Bloco de Texto Principal 2 -->
                <h2 class="text-xl mt-6 font-bold text-primary-500">{$t('course')} - {course_name} {classes.course_semester}. {$t('semester')} - {classes.course_year}</h2>
              </div>
              <section class="container mx-auto mt-20 mb-10 min-h-[50vh]">  
                <!-- Responsive Container (recommended) -->
                <div class="flex flex-wrap justify-start gap-3">
                  {#each groups as group (group.id)}
                    <div class="p-4 rounded-lg shadow-md min-h-60 max-h-72 overflow-y-auto overflow-x-auto w-[26vw] bg-secondary-600 dark:bg-dark-secondary
                    {isGroupEvaluated(group) ? 'border-4 border-green-700' : 'border-4 border-secondary-600 dark:border-dark-secondary'} m-2">
                    <div class="flex justify-between">
                      <h3 class="text-md w-24 mt-2 mb-2 font-bold">{group.group_id}</h3>
                      {#if isGroupEvaluated(group)}
                        <button 
                          on:click={() => openEGModalRubric(group.id, group.student_ids, group.group_id)} 
                          class="w-5 h-5 text-green-600 hover:text-gray-300 mr-3">
                          <FaEye/>  <!-- Ícone de olho para indicar visualização da avaliação -->
                        </button>
                      {:else}
                        <button 
                          on:click={() => openModalRubric(group.id, group.student_ids, group.group_id)} 
                          class="w-5 h-5 text-primary-500 hover:text-primary-300 mr-3">
                          <FaRegListAlt/>  <!-- Ícone de lista para iniciar a avaliação -->
                        </button>
                      {/if}
                    </div>
                    <GroupCardEvaluation group_id={group.group_id} gid_ref={group.id} student_ids={group.student_ids} class_id={class_id} />
                  </div>
                  {/each}
                </div>
              </section>
            </div>
        <!-- Modal de Avaliação -->
        <dialog id="rubricModal" class="modal">
          <div class="w-[85%] bg-surface-400 dark:bg-dark-surface p-6 m-2 flex flex-col items-center justify-center relative">
          <div class="flex items-center justify-between">
            <!-- Botão Cancelar -->
            <form method="dialog">
              <button on:click={closeModalRubric} class="absolute top-4 right-4 rounded-full w-8 h-8 flex items-center justify-center bg-primary-500 text-white dark:bg-red-800">X</button>
            </form>
            <!-- Título centralizado -->
            <h3 class="text-lg font-bold ml-5 mb-4 text-center">{$t('group_evaluation')}: {currentGroup?.group_name}</h3>
          </div>
            <!-- Matriz ou conteúdo do modal -->
            <div class="w-full overflow-x-auto">
              <GroupModalRubric docId={rubricModel.id}  groupId={currentGroup?.group_id}  professorId={professorId} evaluationId={evaluation.id} student_ids={currentGroup?.student_ids}></GroupModalRubric>
            </div>
          </div>
        </dialog>  
        
         <!-- Modal de Avaliação -->
         <dialog id="EGrubricModal" class="modal">
          <div class="w-[85%] bg-surface-400 dark:bg-dark-surface p-6 m-2 flex flex-col items-center justify-center relative">
          <div class="flex items-center justify-between">
            <!-- Botão Cancelar -->
            <form method="dialog">
              <button on:click={closeEGModalRubric} class="absolute top-4 right-4 rounded-full w-8 h-8 flex items-center justify-center bg-primary-500 text-white dark:bg-red-800">X</button>
            </form>
            <!-- Título centralizado -->
            <h3 class="text-lg font-bold ml-5 mb-4 text-center">{$t('group_evaluation')}: {currentGroup?.group_name}</h3>
          </div>
            <!-- Matriz ou conteúdo do modal -->
            <div class="w-full overflow-x-auto">
              <EGModalRubric 
              docId={rubricModel.id}  
              groupId={currentGroup?.group_id}  
              professorId={professorId} 
              evaluationId={evaluation.id} 
              student_ids={currentGroup?.student_ids}>
            </EGModalRubric>
            </div>
          </div>
        </dialog>   
        <Drawer></Drawer>
      </div>
    </div>
    <Footer></Footer>
  </main>
  
  <style>
  
  </style>