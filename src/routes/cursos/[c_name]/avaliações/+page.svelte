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
  import ModalRubric from '$lib/components/rubric/ModalRubric.svelte';
    import { reload } from 'firebase/auth';

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
  let currentStudent: { studentId:string, nome: string, sobrenome: string } | null = null;

  function openModalRubric(studentId: string, studentName: string, studentLastName: string) {
    currentStudent = { studentId, nome: studentName, sobrenome: studentLastName };
    const modal = document.getElementById('rubricModal');
    if (modal) {
      // @ts-ignore
      modal.showModal();
    }
  }
  
  function closeModalRubric() {
    currentStudent = null;
    const modal = document.getElementById('rubricModal');
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

  $: {
    if ($page.data) {
      classes = $page.data.classes; // Acesse o objeto classes diretamente
      course_name = $page.data.course_name; // Acesse course_name diretamente
      evaluation = $page.data.evaluation; // Acesse evaluations diretamente
      rubricModel = $page.data.rubricModel; // Acesse rubric models diretamente
      students = $page.data.students; // Acesse students diretamente
      class_id = $page.data.class_id; // Acesse o class_id diretamente
      professorId = $page.data.professorId; // Acesse o professorId diretamente
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
                      <td>{getStudentStatus(student.id)}</td>
                      <td>
                        <div class="flex items-center flex-nowrap">
                          <button on:click={() => openModalRubric(student.id, student.nome, student.sobrenome)} class="w-5 h-5 text-primary-500 hover:text-primary-300 mr-3">
                            <FaRegListAlt/>
                          </button>
                          <button class="w-5 h-5 text-green-600 dark:text-green-400 hover:text-green-400 dark:hover:text-green-200 mr-3">
                            <FaEye/>
                          </button>
                          <button class="w-5 h-5 text-red-700 hover:text-red-500 mr-3">
                            <FaTrashAlt/>
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
        <!-- Modal de Avaliação -->
        <dialog id="rubricModal" class="modal">
          <div class="w-[85%] bg-secondary-500 dark:bg-dark-surface p-6 m-2 flex flex-col items-center justify-center relative">
          <div class="flex items-center justify-between">
            <!-- Botão Cancelar -->
            <form class="mr-12" method="dialog">
              <button on:click={closeModalRubric} class="btn bg-secondary-200 text-white dark:bg-dark-secondary">X</button>
            </form>
            <!-- Título centralizado -->
            <h3 class="text-lg font-bold ml-5 mb-4 text-center">Avaliação do Aluno {currentStudent?.nome} {currentStudent?.sobrenome}</h3>
          </div>
            <!-- Matriz ou conteúdo do modal -->
            <div class="w-full overflow-x-auto">
              <ModalRubric docId={rubricModel.id} studentId={currentStudent?.studentId} professorId={professorId} evaluationId={evaluation.id}></ModalRubric>
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