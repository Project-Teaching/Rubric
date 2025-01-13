<script lang="ts">
  import { page } from '$app/stores';
  import Breadcrumbs from '$lib/components/Breadcrumbs.svelte';
  import Footer from '$lib/components/Footer.svelte';
  import NavBar from '$lib/components/NavBar.svelte';
  import Drawer from '$lib/components/Drawer.svelte';
  import { SlideToggle, ProgressBar } from '@skeletonlabs/skeleton';
  import { goto } from '$app/navigation';
  import { doc, deleteDoc } from 'firebase/firestore';
  import { db } from '$lib/firebase'; // Ajuste o caminho conforme sua configuração

  // @ts-ignore
  import FaRegListAlt from 'svelte-icons/fa/FaRegListAlt.svelte'
  // @ts-ignore
  import FaEye from 'svelte-icons/fa/FaEye.svelte'
  // @ts-ignore
  import FaTrashAlt from 'svelte-icons/fa/FaTrashAlt.svelte'
  // @ts-ignore
  import FaBell from 'svelte-icons/fa/FaBell.svelte'
  import Modal from '$lib/components/Modal.svelte';
  import { t } from 'svelte-i18n';
  let classes: { 
        course_id: string, course_semester: number, course_year: number, professors: any[], students: any[]
      };
  let evaluations: { 
        id: string, evaluation_id: string, evaluation_name: string, evaluation_date: string, evaluation_major: string, evaluation_course: string, class_id: string, professor_id: any[], rubric_model_id: string, evaluation_result: evaluation_results[]
      }[];
  let models: {
        rubric_id: string, model_name: string, version: number
  }[];
  let students: {
     student_id: string, email: string, nome: string, matricula: string, sobrenome: string
  }[];

  interface evaluation_results {
    evaluation_comment: string, evaluation_notes: string, groupd_id: string, student_id: string, score: number
  }   

  let course_name: string;
  let class_id: string;
  let value: boolean = false;
  let evaluationToRemove: string | null = null;

  $: {
    if ($page.data) {
      classes = $page.data.classes; // Acesse o objeto classes diretamente
      course_name = $page.data.course_name; // Acesse course_name diretamente
      evaluations = $page.data.evaluations; // Acesse evaluations diretamente
      models = $page.data.models; // Acesse rubric models diretamente
      students = $page.data.students; // Acesse students diretamente
      class_id = $page.data.class_id; // Acesse o class_id diretamente
    }
  }

  function calculateProgress(evaluation: any) {
    const totalStudents = classes.students.length; // Total de alunos na turma
    const evaluatedStudents = evaluation.evaluation_result.length-1; // Total de avaliações realizadas
    return { evaluatedStudents, totalStudents };
  }

  // Função para abrir o modal
  function abrirModalRE(id: string) {
    evaluationToRemove = id;
    const modal = document.getElementById('remove_evaluation_modal');
    if (modal) {
      // @ts-ignore
      modal.showModal();
    }
  }

  // Função para remover uma avaliação
  async function removeEvaluation() {
    if (evaluationToRemove) {
      try {
        const evaluationDocRef = doc(db, 'evaluations', evaluationToRemove);

        // Remove evaluation from the evaluations
        evaluations = evaluations.filter(evaluation => evaluation.id !== evaluationToRemove);

        // Remove the document from the Firestore
        await deleteDoc(evaluationDocRef);

        // Notifique o usuário ou atualize o estado se necessário
        console.log(`Avaliação com id ${evaluationToRemove} removida com sucesso.`);
      } catch (error) {
        console.error(`Erro ao remover a avaliiação: ${evaluationToRemove}`, error);
      } finally {
        // Feche o modal
        const modal = document.getElementById('remove_evaluation_modal');
        if (modal) {
          // @ts-ignore
          modal.close();
        }
        // Limpe a rubrica para remover
        evaluationToRemove = null;
      }
    }
  }

  async function openEvaluationPage(id: string) {
  // Navegar para a página de avaliações, incluindo class_id e evaluation_id como parâmetros da URL
  goto(`/cursos/${course_name}/avaliações?class_id=${class_id}&evaluation_id=${id}`);
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
            <h1 class="text-2xl font-bold text-primary-500">{$t('course')} - {course_name} <br /> {classes.course_semester}. {$t('semester')} - {classes.course_year}</h1>
          </div>
          <section class="container mx-auto mt-20 mb-10 min-h-[50vh]">  
            <!-- Responsive Container (recommended) -->
            <div class="table-container">
              <div class="w-full mb-2 flex justify-between flex-nowrap">
                <p class="text-primary-500 font-bold text-lg">                    
                  {#if value == true}
                  {$t('alumn_list')}
                  {:else}
                  {$t('evaluation_list')}
                  {/if}
                </p>
                <div class="flex items-center">
                  <p class="font-bold text-md mr-2">
                    {#if value == true}
                    {$t('evaluation_list')}
                    {:else}
                    {$t('alumn_list')}
                    {/if}
                  </p>
                  <SlideToggle name="slide-medium" background="bg-secondary-700 dark:bg-secondary-900" active="bg-primary-500" size="md" bind:checked={value}>
                  </SlideToggle>
                </div>
              </div>
              {#if value == true}
              <!-- Native Table Element -->
              <table class="table table-hover bg-gray-100 dark:bg-stone-800">
                <thead>
                  <tr class="bg-secondary-500 dark:bg-dark-secondary">
                    <th>{$t('evaluations_table_student_name')}</th>
                    <th>{$t('evaluations_table_student_email')}</th>
                    <th>{$t('evaluations_table_student_id')}</th>
                    <th>{$t('evaluations_table_actions')}</th>
                  </tr>
                </thead>
                <tbody>
                  {#each students as student}
                    <tr>
                      <td>{student.nome} {student.sobrenome}</td>
                      <td>{student.email}</td>
                      <td>{student.matricula}</td>
                      <td>
                        <div class="flex items-center flex-nowrap">
                          <button class="w-5 h-5 text-primary-500 hover:text-primary-300 mr-3">
                            <FaRegListAlt/>
                          </button>
                          <button class="w-5 h-5 text-green-600 dark:text-green-400 hover:text-green-400 dark:hover:text-green-200 mr-3">
                            <FaEye/>
                          </button>
                          <button class="w-5 h-5 text-red-700 hover:text-red-500 mr-3">
                            <FaTrashAlt/>
                          </button>
                          <button class="w-5 h-5 text-cyan-600 dark:text-cyan-400 hover:text-cyan-400 dark:hover:text-cyan-200">
                            <FaBell/>
                          </button>
                        </div>
                      </td>
                    </tr>
                  {/each}
                </tbody>
                <tfoot>
                  <tr class="bg-secondary-500 dark:bg-dark-secondary">
                    <th colspan="2">{$t('evaluations_table_import_students')}</th>
                    <td colspan="2">
                    </td>
                  </tr>
                </tfoot>
              </table>
              {:else}
              <!-- Native Table Element -->
               <table class="table table-hover bg-gray-100 dark:bg-stone-800">
                <thead>
                  <tr class="bg-secondary-500 dark:bg-dark-secondary">
                    <th>{$t('evaluations_table_evaluation_name')}</th>
                    <th>{$t('evaluations_table_evaluation_date')}</th>
                    <th>{$t('evaluations_table_actions')}</th>
                    <th>{$t('evaluations_table_evaluation_progress')}</th>
                  </tr>
                </thead>
                <tbody>
                  {#each evaluations as evaluation}
                    {#await calculateProgress(evaluation) then progress}
                    <tr>
                      <td>{evaluation.evaluation_name}</td>
                      <td>{evaluation.evaluation_date}</td>
                      <td>
                        <div class="flex items-center flex-nowrap">
                          <button class="w-5 h-5 text-primary-500 hover:text-primary-300 mr-3" on:click={() => openEvaluationPage(evaluation.id)}>
                            <FaRegListAlt/>
                          </button>
                          <button class="w-5 h-5 text-green-600 dark:text-green-400 hover:text-green-400 dark:hover:text-green-200 mr-3">
                            <FaEye/>
                          </button>
                          <button on:click={() => abrirModalRE(evaluation.id)} class="w-5 h-5 text-red-700 hover:text-red-500 mr-3">
                            <FaTrashAlt/>
                          </button>
                          <button class="w-5 h-5 text-cyan-600 dark:text-cyan-400 hover:text-cyan-400 dark:hover:text-cyan-200">
                            <FaBell/>
                          </button>
                        </div>
                      </td>
                      <td class="flex items-center">
                        <ProgressBar height="h-4" rounded="rounded-md" meter="bg-primary-500" track="bg-secondary-600" value={progress.evaluatedStudents} max={progress.totalStudents} />
                        <span class="ml-2 text-base font-semibold">{progress.evaluatedStudents}/{progress.totalStudents}</span>
                      </td>
                    </tr>
                    {/await}
                  {/each}
                </tbody>
                <tfoot>
                  <tr class="bg-secondary-500 dark:bg-dark-secondary">
                    <th colspan="2">{$t('evaluations_table_add_new_evaluation')}</th>
                    <td colspan="2">
                      <form action="./{course_name}/nova avaliação" method="get">
                        <input type="hidden" name="class_id" value={class_id}>
                        <select class="select border-none w-[70%] bg-gray-100 dark:bg-stone-800 rounded-md p-2 mr-2" name="rubric_model_id">
                          {#each models as model}
                            <option value={model.rubric_id}>{model.model_name} V. {model.version}</option>
                          {/each}
                        </select>
                        <button class="btn bg-primary-500 font-semibold" type="submit">{$t('select')}</button>
                      </form>
                    </td>
                  </tr>
                </tfoot>
              </table>
              {/if}
            </div>
          </section>
        </div>
        <Drawer></Drawer>
      </div>
    </div>
    <Modal modalId={"remove_evaluation_modal"} modalFunction={removeEvaluation} modalTitle={$t('modal_delete_title')} modalMessage={$t('modal_evaluation_delete_message')} modalButton={$t('modal_delete_btn')} />
    <Footer></Footer>
  </main>
  
  <style>
  
  </style>