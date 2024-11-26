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
    import ModalRubric from '$lib/components/rubric/ModalRubric.svelte';
    import EditRubric from '$lib/components/rubric/EditRubric.svelte';

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
     student_id: string, email: string, nome: string, matricula: string, sobrenome: string
  }[];

  interface evaluation_results {
    evaluation_comment: string, evaluation_notes: string, groupd_id: string, student_id: string, score: number
  }   

  let course_name: string;
  let class_id: string;

  $: {
    if ($page.data) {
      classes = $page.data.classes; // Acesse o objeto classes diretamente
      course_name = $page.data.course_name; // Acesse course_name diretamente
      evaluation = $page.data.evaluation; // Acesse evaluations diretamente
      rubricModel = $page.data.rubricModel; // Acesse rubric models diretamente
      students = $page.data.students; // Acesse students diretamente
      class_id = $page.data.class_id; // Acesse o class_id diretamente
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
            <h1 class="text-2xl font-bold text-primary-500">Disciplina - {course_name} {classes.course_semester}. Semestre - {classes.course_year} <br /> Avaliação: {evaluation.evaluation_name}</h1>
          </div>
          <section class="container mx-auto mt-20 mb-10 min-h-[50vh]">  
            <!-- Responsive Container (recommended) -->
            <div class="table-container">
              <div class="w-full mb-2 flex justify-between flex-nowrap">
                <p class="text-primary-500 font-bold text-lg">                    
                  Lista de Alunos
                </p>
              </div>
              <!-- Native Table Element -->
              <table class="table table-hover bg-gray-100 dark:bg-stone-800">
                <thead>
                  <tr class="bg-secondary-500 dark:bg-dark-secondary">
                    <th>Nome do Aluno</th>
                    <th>Email</th>
                    <th>Matrícula</th>
                    <th>Situação</th>
                    <th>Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {#each students as student}
                    <tr>
                      <td>{student.nome} {student.sobrenome}</td>
                      <td>{student.email}</td>
                      <td>{student.matricula}</td>
                      <td>Não Avaliado</td>
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
                    <td colspan="5">
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </section>
        </div>
        <div class="hidden"><ModalRubric docId={rubricModel.id}></ModalRubric></div>
        <Drawer></Drawer>
      </div>
    </div>
    <Footer></Footer>
  </main>
  
  <style>
  
  </style>