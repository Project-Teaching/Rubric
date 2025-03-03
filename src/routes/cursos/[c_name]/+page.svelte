<script lang="ts">
  import { page } from "$app/stores";
  import Breadcrumbs from "$lib/components/Breadcrumbs.svelte";
  import Footer from "$lib/components/Footer.svelte";
  import NavBar from "$lib/components/NavBar.svelte";
  import Drawer from "$lib/components/Drawer.svelte";
  import { SlideToggle, ProgressBar } from "@skeletonlabs/skeleton";
  import { goto } from "$app/navigation";
  import { doc, deleteDoc } from "firebase/firestore";
  import { db } from "$lib/firebase"; // Ajuste o caminho conforme sua configuração
  // @ts-ignore
  import FaRegListAlt from "svelte-icons/fa/FaRegListAlt.svelte";
  // @ts-ignore
  import FaEye from "svelte-icons/fa/FaEye.svelte";
  // @ts-ignore
  import FaTrashAlt from "svelte-icons/fa/FaTrashAlt.svelte";
  // @ts-ignore
  import FaBell from "svelte-icons/fa/FaBell.svelte";
  // @ts-ignore
  import IoIosPeople from 'svelte-icons/io/IoIosPeople.svelte'
  import Modal from "$lib/components/Modal.svelte";
  import { t } from 'svelte-i18n';
  import Shepherd from "shepherd.js";
  import { onMount } from "svelte";
  
  let classes: {
    course_id: string;
    course_semester: number;
    course_year: number;
    professors: any[];
    students: any[];
  };
  let evaluations: {
    id: string;
    evaluation_id: string;
    evaluation_name: string;
    evaluation_date: string;
    evaluation_major: string;
    evaluation_course: string;
    class_id: string;
    professor_id: any[];
    rubric_model_id: string;
    group_evaluation: boolean;
    evaluation_result: evaluation_results[];
  }[];

  let models: {
    rubric_id: string;
    model_name: string;
    version: number;
  }[];
  let students: {
    id: string;
    email: string;
    nome: string;
    matricula: string;
    sobrenome: string;
  }[];

  interface evaluation_results {
    evaluation_comment: string;
    evaluation_notes: string;
    groupd_id: string;
    student_id: string;
    professor_id: string;
    score: number;
    rubric_evaluation: rubric_evaluation[];
  }

  interface rubric_evaluation {
    criterion_number: number;
    level_number: number;
  }

  let course_name: string;
  let class_id: string;
  let value: boolean = false;
  let evaluationToRemove: string | null = null;
  let tour: any;

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
    const modal = document.getElementById("remove_evaluation_modal");
    if (modal) {
      // @ts-ignore
      modal.showModal();
    }
  }

  // Função para remover uma avaliação
  async function removeEvaluation() {
    if (evaluationToRemove) {
      try {
        const evaluationDocRef = doc(db, "evaluations", evaluationToRemove);

        // Remove evaluation from the evaluations
        evaluations = evaluations.filter(
          (evaluation) => evaluation.id !== evaluationToRemove
        );

        // Remove the document from the Firestore
        await deleteDoc(evaluationDocRef);

        // Notifique o usuário ou atualize o estado se necessário
        console.log(
          `Avaliação com id ${evaluationToRemove} removida com sucesso.`
        );
      } catch (error) {
        console.error(
          `Erro ao remover a avaliiação: ${evaluationToRemove}`,
          error
        );
      } finally {
        // Feche o modal
        const modal = document.getElementById("remove_evaluation_modal");
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
    goto(
      `/cursos/${course_name}/avaliações?class_id=${class_id}&evaluation_id=${id}`
    );
  }

  async function openGroupEvaluationPage(id: string) {
    goto(
      `/cursos/${course_name}/grupos/avaliações?class_id=${class_id}&evaluation_id=${id}&group_evaluation=true`
    );
  }

  async function openGroupPage() {
    goto(
      `/cursos/${course_name}/grupos?class_id=${class_id}`
    );
  }

  function openNewStudentPage() {
    // Navegar para a página de novo aluno, incluindo class_id como parâmetro da URL
    goto(`/cursos/${course_name}/novo aluno?class_id=${class_id}`);
  }

  
  const startTour = async () => {
    
    tour = new Shepherd.Tour({
      defaultStepOptions: {
        classes: "dark:text-white shadow-md bg-surface-500 text-black",
        scrollTo: true,
      },
      useModalOverlay: true,
    });

    tour.addStep({
      id: "course_step-1",
      text: $t("course_tour_step_1"),
      attachTo: {
        element: "#course_title_manager",
        on: "right",
      },
      buttons: [
        {
          text: $t("tour_finish"),
          action: tour.complete,
        },
        {
          text: $t("tour_next"),
          action: tour.next,
        }
      ],
    });

    tour.addStep({
      id: "course_step-2",
      text: $t("course_tour_step_2"),
      attachTo: {
        element: "#table_switcher",
        on: "top",
      },
      buttons: [
        {
          text: $t("tour_back"),
          action: tour.back,
        },
        {
          text: $t("tour_finish"),
          action: tour.complete,
        },
        {
          text: $t("tour_next"),
          action: tour.next,
        }
      ],
    });

    tour.addStep({
      id: "course_step-3",
      text: $t("course_tour_step_3"),
      attachTo: {
        element: "#evaluation_table",
        on: "top",
      },
      buttons: [
        {
          text: $t("tour_back"),
          action: tour.back,
        },
        {
          text: $t("tour_finish"),
          action: tour.complete,
        },
        {
          text: $t("tour_next"),
          action: tour.next,
        }
      ],
    });

    tour.addStep({
      id: "course_step-4",
      text: $t("course_tour_step_4"),
      attachTo: {
        element: "#progress_area",
        on: "top",
      },
      buttons: [
        {
          text: $t("tour_back"),
          action: tour.back,
        },
        {
          text: $t("tour_finish"),
          action: tour.complete,
        },
        {
          text: $t("tour_next"),
          action: tour.next,
        }
      ],
    });

    tour.addStep({
      id: "course_step-5",
      text: $t("course_tour_step_5"),
      attachTo: {
        element: "#actions_area",
        on: "top",
      },
      buttons: [
        {
          text: $t("tour_back"),
          action: tour.back,
        },
        {
          text: $t("tour_finish"),
          action: tour.complete,
        },
        {
          text: $t("tour_next"),
          action: tour.next,
        }
      ],
    });

    tour.addStep({
      id: "course_step-6",
      text: $t("course_tour_step_6"),
      attachTo: {
        element: "#evaluation_notify",
        on: "top",
      },
      buttons: [
        {
          text: $t("tour_back"),
          action: tour.back,
        },
        {
          text: $t("tour_finish"),
          action: tour.complete,
        },
        {
          text: $t("tour_next"),
          action: tour.next,
        }
      ],
    });

    tour.addStep({
      id: "course_step-7",
      text: $t("course_tour_step_7"),
      attachTo: {
        element: "#evaluation_remove",
        on: "top",
      },
      buttons: [
        {
          text: $t("tour_back"),
          action: tour.back,
        },
        {
          text: $t("tour_finish"),
          action: tour.complete,
        },
        {
          text: $t("tour_next"),
          action: tour.next,
        }
      ],
    });

    tour.addStep({
      id: "course_step-8",
      text: $t("course_tour_step_8"),
      attachTo: {
        element: "#model_view",
        on: "top",
      },
      buttons: [
        {
          text: $t("tour_back"),
          action: tour.back,
        },
        {
          text: $t("tour_finish"),
          action: tour.complete,
        },
        {
          text: $t("tour_next"),
          action: tour.next,
        }
      ],
    });

    tour.addStep({
      id: "course_step-9",
      text: $t("course_tour_step_9"),
      attachTo: {
        element: "#evaluation_view",
        on: "top",
      },
      buttons: [
        {
          text: $t("tour_lets_go"),
          action: async () => { 
          tour.complete();
          await goto('/cursos/Teoria%20da%20Computação/avaliações?class_id=YwPKmwoqCwGzzcREmGTZ&evaluation_id=sYhdd9SJVCDzdKqsZ9QI&tour_active=true');
          },
        },
        {
          text: $t("tour_skip"),
          action: tour.complete,
        },
      ],
    });

    tour.start();
  };

  async function sendEvaluationNotification(evaluationId: string) {
    console.log("Enviando notificação para avaliação:", evaluationId);

    // Filtra a avaliação correta pelo `id` do Firebase
    const evaluation = evaluations.find(e => e.id === evaluationId);

    if (!evaluation) {
      console.error("Erro: Avaliação não encontrada!", evaluationId);
      return alert("Erro: Avaliação não encontrada!");
    }

    if (!evaluation.evaluation_result || evaluation.evaluation_result.length === 0) {
      console.error("Erro: Nenhum resultado de avaliação encontrado!", evaluation);
      return alert("Erro: Nenhum resultado de avaliação encontrado!");
    }

    // Filtra apenas os alunos que participam dessa avaliação
    const filtered_students = students.filter(student => {
        const match = evaluation.evaluation_result.some(result => result.student_id === student.id);
        console.log(`🧐 Verificando aluno ${student.nome} (ID: ${student.id}):`, match);
        return match;
    });

    //console.log("Dados filtrados:", { evaluation});

    try {
      const response = await fetch("/api/notify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ evaluation, students: filtered_students }),
      });

      const responseText = await response.text(); // Captura o erro detalhado do backend
      console.log("Resposta do servidor:", responseText);

      if (!response.ok) {
        throw new Error("Erro ao enviar notificação.");
      }

      alert("Notificação enviada com sucesso!");
    } catch (error) {
      console.error("Erro ao enviar notificação:", error);
    }
  }

  onMount(() => {
    if ($page.url.searchParams.get('tour_active')) {
        startTour();
    }
  });
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
        <div class="h-2 flex justify-center text-center">
          <!-- Bloco de Texto Principal 1 -->
          <h1 id="course_title_manager" class="h-8 text-2xl font-bold text-primary-500">
            {$t('course')} - {course_name} <br />
            {classes.course_semester}. {$t('semester')} - {classes.course_year}
          </h1>
        </div>
        <section class="container mx-auto mt-20 mb-10 min-h-[60vh]">
          <!-- Responsive Container (recommended) -->
          <div class="table-container">
            <div id="table_switcher" class="w-full mb-2 flex justify-between flex-nowrap">
              <p class="text-primary-500 font-bold text-lg">
                {#if value == true}
                  {$t('alumn_list')}
                {:else}
                  {$t('evaluation_list')}
                {/if}
              </p>
              <button
              class="ml-16 w-10 h-10 bg-blue-600 rounded-xl text-white hover:bg-blue-500 hover:text-gray-300"
              on:click={() => openGroupPage()}
              >
                <IoIosPeople />
              </button>
              <div class="flex items-center">
                <p class="font-bold text-md mr-2">
                  {#if value == true}
                    {$t('evaluation_list')}
                  {:else}
                    {$t('alumn_list')}
                  {/if}
                </p>
                <SlideToggle
                  name="slide-medium"
                  background="bg-secondary-700 dark:bg-secondary-900"
                  active="bg-primary-500"
                  size="md"
                  bind:checked={value}
                ></SlideToggle>
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
                          <button
                            class="w-5 h-5 text-primary-500 hover:text-primary-300 mr-3"
                          >
                            <FaRegListAlt />
                          </button>
                          <button
                            class="w-5 h-5 text-green-600 dark:text-green-400 hover:text-green-400 dark:hover:text-green-200 mr-3"
                          >
                            <FaEye />
                          </button>
                          <button
                            class="w-5 h-5 text-red-700 hover:text-red-500 mr-3"
                          >
                            <FaTrashAlt />
                          </button>
                          <button
                            class="w-5 h-5 text-cyan-600 dark:text-cyan-400 hover:text-cyan-400 dark:hover:text-cyan-200"
                          >
                            <FaBell />
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
                      <button
                        on:click={openNewStudentPage}
                        class="btn bg-primary-500 font-semibold"
                        >{$t('student_add')}</button
                      >
                    </td>
                  </tr>
                </tfoot>
              </table>
            {:else}
              <!-- Native Table Element -->
              <table id="evaluation_table" class="table table-hover bg-gray-100 dark:bg-stone-800">
                <thead>
                  <tr class="bg-secondary-500 dark:bg-dark-secondary">
                    <th>{$t('evaluations_table_evaluation_name')}</th>
                    <th>{$t('evaluations_table_evaluation_date')}</th>
                    <th id="actions_area">{$t('evaluations_table_actions')}</th>
                    <th id="progress_area">{$t('evaluations_table_evaluation_progress')}</th>
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
                            {#if evaluation.group_evaluation}
                              <button
                                class="w-5 h-5 text-primary-500 hover:text-primary-300 mr-3"
                                on:click={() => openGroupEvaluationPage(evaluation.id)}
                              >
                                <IoIosPeople />
                              </button>
                            {:else}
                              <button
                                id="evaluation_view"
                                class="w-5 h-5 text-primary-500 hover:text-primary-300 mr-3"
                                on:click={() => openEvaluationPage(evaluation.id)}
                              >
                                <FaRegListAlt />
                              </button>
                            {/if}
                            <button
                              id="model_view"
                              class="w-5 h-5 text-green-600 dark:text-green-400 hover:text-green-400 dark:hover:text-green-200 mr-3"
                            >
                              <FaEye />
                            </button>
                            <button
                              id="evaluation_remove"
                              on:click={() => abrirModalRE(evaluation.id)}
                              class="w-5 h-5 text-red-700 hover:text-red-500 mr-3"
                            >
                              <FaTrashAlt />
                            </button>
                            <button
                              id="evaluation_notify"
                              class="w-5 h-5 text-cyan-600 dark:text-cyan-400 hover:text-cyan-400 dark:hover:text-cyan-200"
                              on:click={() => sendEvaluationNotification(evaluation.id)}
                            >
                              <FaBell />
                            </button>
                          </div>
                        </td>
                        <td class="flex items-center">
                          <ProgressBar
                            height="h-4"
                            rounded="rounded-md"
                            meter="bg-primary-500"
                            track="bg-secondary-600"
                            value={progress.evaluatedStudents}
                            max={progress.totalStudents}
                          />
                          <span class="ml-2 text-base font-semibold"
                            >{progress.evaluatedStudents}/{progress.totalStudents}</span
                          >
                        </td>
                      </tr>
                    {/await}
                  {/each}
                </tbody>
                <tfoot>
                  <tr class="bg-secondary-500 dark:bg-dark-secondary">
                    <th colspan="2">{$t('evaluations_table_add_new_evaluation')}</th>
                    <td colspan="2">
                      <form
                        action="./{course_name}/nova avaliação"
                        method="get"
                      >
                        <input type="hidden" name="class_id" value={class_id} />
                        <select
                          class="select border-none w-[70%] bg-gray-100 dark:bg-stone-800 rounded-md p-2 mr-2"
                          name="rubric_model_id"
                        >
                          {#each models as model}
                            <option value={model.rubric_id}
                              >{model.model_name} V. {model.version}</option
                            >
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
    <Modal modalId={"remove_evaluation_modal"} modalFunction={removeEvaluation} modalTitle={$t('modal_delete_title')} modalMessage={$t('modal_evaluation_delete_message')} modalButton={$t('modal_delete_btn')} />
    <Footer></Footer>
  </main>
  
  <style>
  </style>
