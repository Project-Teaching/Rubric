<script lang="ts">
  import { page } from '$app/stores';
  import Breadcrumbs from '$lib/components/Breadcrumbs.svelte';
  import Footer from '$lib/components/Footer.svelte';
  import NavBar from '$lib/components/NavBar.svelte';
  import Drawer from '$lib/components/Drawer.svelte';
  import { SlideToggle, ProgressBar } from '@skeletonlabs/skeleton';
  
  // @ts-ignore
  import FaRegListAlt from 'svelte-icons/fa/FaRegListAlt.svelte'
  // @ts-ignore
  import FaEye from 'svelte-icons/fa/FaEye.svelte'
  // @ts-ignore
  import FaTrashAlt from 'svelte-icons/fa/FaTrashAlt.svelte'
  // @ts-ignore
  import FaBell from 'svelte-icons/fa/FaBell.svelte'

  let classes: { 
        course_id: string, course_semester: number, course_year: number, professors: any[], students: any[]
      };
  let evaluations: { 
        evaluation_id: string, evaluation_name: string, evaluation_date: string, evaluation_major: string, evaluation_course: string, class_id: string, professor_id: any[], rubric_model_id: string, evaluation_result: evaluation_results[]
      }[];
  let models: {
        rubric_id: string, model_name: string, version: number
  }[];

  interface evaluation_results {
    evaluation_comment: string, evaluation_notes: string, groupd_id: string, student_id: string, score: number
  }   

  let course_name: string;
  let class_id: string;
  let value: boolean = false;

  $: {
    if ($page.data) {
      classes = $page.data.classes; // Acesse o objeto classes diretamente
      course_name = $page.data.course_name; // Acesse course_name diretamente
      evaluations = $page.data.evaluations; // Acesse evaluations diretamente
      models = $page.data.models; // Acesse rubric models diretamente
      class_id = $page.data.class_id; // Acesse o class_id diretamente
    }
  }

  function calculateProgress(evaluation: any) {
    const totalStudents = classes.students.length; // Total de alunos na turma
    const evaluatedStudents = evaluation.evaluation_result.length; // Total de avaliações realizadas
    return { evaluatedStudents, totalStudents };
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
            <h1 class="text-2xl font-bold text-primary-500">Disciplina - {course_name} <br /> {classes.course_semester}. Semestre - {classes.course_year}</h1>
          </div>
          <section class="container mx-auto mt-20 mb-10 min-h-[50vh]">  
            <!-- Responsive Container (recommended) -->
            <div class="table-container">
              <div class="w-full mb-2 flex justify-between flex-nowrap">
                <p class="text-primary-500 font-bold text-lg">                    
                  {#if value == true}
                  Lista de Alunos
                  {:else}
                  Lista de Avaliações
                  {/if}
                </p>
                <div class="flex items-center">
                  <p class="font-bold text-md mr-2">
                    {#if value == true}
                    Lista de Avaliações
                    {:else}
                    Lista de Alunos
                    {/if}
                  </p>
                  <SlideToggle name="slide-medium" background="bg-secondary-700 dark:bg-secondary-900" active="bg-primary-500" size="md" bind:checked={value}>
                  </SlideToggle>
                </div>
              </div>
              <!-- Native Table Element -->
              <table class="table table-hover bg-gray-100 dark:bg-stone-800">
                <thead>
                  <tr class="bg-secondary-500 dark:bg-dark-secondary">
                    <th>Nome da Avaliação</th>
                    <th>Prazo Final para Avaliar</th>
                    <th>Ações</th>
                    <th>Progresso</th>
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
                    <th colspan="2">Adicionar Nova Avaliação</th>
                    <td colspan="2">
                      <form action="./{course_name}/nova avaliação" method="get">
                        <input type="hidden" name="class_id" value={class_id}>
                        <select class="select border-none w-[70%] bg-gray-100 dark:bg-stone-800 rounded-md p-2 mr-2" name="rubric_model_id">
                          {#each models as model}
                            <option value={model.rubric_id}>{model.model_name} V. {model.version}</option>
                          {/each}
                        </select>
                        <button class="btn bg-primary-500 font-semibold" type="submit">Selecionar</button>
                      </form>
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </section>
        </div>
        <Drawer></Drawer>
      </div>
    </div>
    <Footer></Footer>
  </main>
  
  <style>
  
  </style>