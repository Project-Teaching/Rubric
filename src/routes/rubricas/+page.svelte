<script lang="ts">
  import { page } from '$app/stores';
  import NavBar from "$lib/components/NavBar.svelte";
  import Footer from "$lib/components/Footer.svelte";
  import Breadcrumbs from "$lib/components/Breadcrumbs.svelte";
  import Drawer from '$lib/components/Drawer.svelte';
  import { Accordion, AccordionItem } from '@skeletonlabs/skeleton';
  import Modal from '$lib/components/Modal.svelte';
  import ModalRubricVisualizar from '$lib/components/rubric/ModalRubricVisualizar.svelte';
  import { t } from 'svelte-i18n';
  import { onMount } from 'svelte';
  import Shepherd from 'shepherd.js';
  import { goto } from '$app/navigation';
  import { writable } from 'svelte/store';
  import { db } from '$lib/firebase';
  import { doc, getDoc, addDoc, collection } from 'firebase/firestore';

  let tour: any;

  let rubricas: { 
        id: string, uid: string, major: string, course: string, performance_levels:any[], criteria: any[], model_name: string, version: number, public: boolean, original_model: string, finished: boolean
      }[]; 

  let publicRubricas: { 
        id: string, uid: string, major: string, course: string, performance_levels:any[], criteria: any[], model_name: string, version: number, public: boolean, original_model: string, finished: boolean
      }[]; 

  let rubricaParaRemover: string | null = null;
  let searchTag = writable('');
  let userID: string | null = null;
  let rubricaVisualizar: string | null = null;

  $: {
    if ($page.data) {
      rubricas = $page.data.rubricas;
      publicRubricas = $page.data.publicRubricas;
      userID = $page.data.userID; // Obtém o userID do servidor
    }
  }

  // Função para redirecionar para a página de edição
  function editarRubrica(id: string) {
      goto(`/rubricas/${id}/editar modelo`);
  }

  // Função para criar um novo modelo de rubrica
  function criarNovaRubrica() {
      goto('/rubricas/criar modelo');
  }

  // Função para abrir o modal
  function abrirModal(id: string) {
    rubricaParaRemover = id;
    const modal = document.getElementById('confirm_modal');
    if (modal) {
      // @ts-ignore
      modal.showModal();
    }
  }

  // Função para visualizar uma rubrica pública
  function visualizarRubrica(id: string) {
    rubricaVisualizar = id;
    const modal = document.getElementById('visualizar_modal');
    if (modal) {
      // @ts-ignore
      modal.showModal();
    }
  }

  // Função para copiar e editar uma rubrica pública
  async function copiarERedirecionarRubrica() {
    if (!rubricaVisualizar) {
      console.error("Rubrica não encontrada");
      return;
    }

    try {
      const docRef = doc(db, 'rubrics', rubricaVisualizar);
      const docSnap = await getDoc(docRef);

      if (!docSnap.exists()) {
        console.error("Rubrica não encontrada");
        return;
      }

      const rubrica = docSnap.data();

      if (!userID) {
        console.error("User ID não encontrado");
        return;
      }

      // Cria uma nova rubrica com os mesmos dados, mas com um novo ID e associada ao usuário atual
      const novaRubrica = {
        ...rubrica,
        uid: userID, // Associa ao usuário atual
        public: false, // Define como privada inicialmente
        version: 1, // Define a versão inicial
        original_model: rubricaVisualizar // Armazena o ID do modelo original
      };

      // Adiciona a nova rubrica ao Firestore
      const newDocRef = await addDoc(collection(db, 'rubrics'), novaRubrica);
      console.log("Rubrica copiada com sucesso, ID:", newDocRef.id);

      // Redireciona para a página de edição da nova rubrica
      goto(`/rubricas/${newDocRef.id}/editar modelo`);

      // Fecha o modal
      const modal = document.getElementById('visualizar_modal');
      if (modal) {
        // @ts-ignore
        modal.close();
      }
    } catch (error) {
      console.error("Erro ao copiar a rubrica: ", error);
    }
  }

  // Função para remover uma rubrica
  async function removerRubrica() {
    if (rubricaParaRemover) {
      try {
        // Remove a rubrica do estado local
        rubricas = rubricas.filter(rubrica => rubrica.id !== rubricaParaRemover);

        // Remove o documento do Firestore
        const rubricDocRef = doc(db, 'rubrics', rubricaParaRemover);
        await deleteDoc(rubricDocRef);

        // Notifique o usuário ou atualize o estado se necessário
        console.log(`Rubrica com id ${rubricaParaRemover} removida com sucesso.`);
      } catch (error) {
        console.error("Erro ao remover a rubrica: ", error);
      } finally {
        // Feche o modal
        const modal = document.getElementById('confirm_modal');
        if (modal) {
          // @ts-ignore
          modal.close();
        }
        // Limpe a rubrica para remover
        rubricaParaRemover = null;
      }
    }
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
      id: "rmanager_step-1",
      text: $t("rmanager_tour_step_1"),
      attachTo: {
        element: "#rm_title",
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
      id: "rmanager_step-2",
      text: $t("rmanager_tour_step_2"),
      attachTo: {
        element: "#search_rm_btn",
        on: "bottom",
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
      id: "rmanager_step-3",
      text: $t("rmanager_tour_step_3"),
      attachTo: {
        element: "#r_remove_btn",
        on: "right",
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
      id: "rmanager_step-4",
      text: $t("rmanager_tour_step_4"),
      attachTo: {
        element: "#r_edit_btn",
        on: "right",
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
      id: "rmanager_step-5",
      text: $t("rmanager_tour_step_5"),
      attachTo: {
        element: "#r_create_btn",
        on: "top",
      },
      buttons: [
        {
          text: $t("tour_lets_go"),
          action: async () => { 
          tour.complete();
          await goto('/rubricas/criar modelo?tour_active=true');
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
        <div class="h-2 flex justify-center"> <!-- Bloco de Texto Principal 1 -->
          <h1 id="rm_title" class="h-8 text-2xl font-bold text-primary-500">{$t('rubric_manager_title1')}</h1>
        </div>
        <section class="container mx-auto mt-10">
          <Accordion>
            <AccordionItem open>
              <svelte:fragment slot="summary"><h3 class="text-primary-500 font-semibold mb-2 text-lg">{$t('my_rubrics')}</h3></svelte:fragment>
              <svelte:fragment slot="content">
                {#if rubricas?.length === 0}
                  <p class="text-center mb-10">
                    {$t('rubric_manager_no_rubric')}
                    <br />
                    {$t('rubric_manager_no_rubric_pt2')}
                  </p>
                {/if}
                <div class="flex flex-wrap gap-8 items-center justify-center">
                  {#each rubricas as rubrica (rubrica.id)}
                    <div class="flex flex-col h-44 w-[25vw] mb-2">
                      <div class="bg-secondary-500 dark:bg-dark-secondary h-32 m-3 rounded-lg shadow-md hover-up">
                        <div class="flex m-4 inset-0 h-full">
                          <div class="text-bg-200 font-bold p-2 rounded mb-2 w-4/5 h-min">
                            #03 Curso(s) <br/>
                            #15 Disciplina(s) <br/>
                            #20 Avaliações
                          </div>
                          <div class="flex flex-col items-end inset-0 ml-4 gap-y-4">
                            <button id="r_remove_btn" on:click={() => abrirModal(rubrica.id)} class="pb-1 bg-error-500 hover:bg-error-900 w-8 h-8 text-white rounded-full">
                              <span class="text-xl font-bold">x</span>
                            </button>
                            <button id="r_edit_btn" on:click={() => editarRubrica(rubrica.id)} class="btn variant-filled-primary text-white dark:text-white w-12 h-12 rounded-full flex items-center justify-center">
                              <span class="text-2xl font-bold">+</span>
                            </button>
                          </div>
                        </div>
                      </div>
                      <p class="text-center text-primary-500 font-semibold">
                          {rubrica.model_name ? rubrica.model_name : $t('blank_rubric_name')}
                      </p>
                    </div>
                  {/each}
                  <div class="flex flex-col h-44 w-[25vw] mb-2">
                    <div class="bg-secondary-500 dark:bg-dark-secondary h-32 m-3 rounded-lg shadow-md hover-up">
                      <div class="flex justify-end items-end m-4 inset-0">
                        <div class="mt-12">
                          <button id="r_create_btn" on:click={criarNovaRubrica} class="bg-primary-500 text-white w-12 h-12 rounded-full flex items-center justify-center shadow-lg">
                            <span class="text-2xl font-bold">+</span>
                          </button>
                        </div>
                      </div>
                    </div>
                    <p class="text-center text-primary-500 font-semibold">
                        {$t('rubric_manager_create_btn')}
                    </p>
                  </div>
                </div>
              </svelte:fragment>
            </AccordionItem>
            <AccordionItem>
              <svelte:fragment slot="summary"><h3 class="text-primary-500 font-semibold mb-2 text-lg">{$t('public_rubrics')}</h3></svelte:fragment>
              <svelte:fragment slot="content">
                <div class="flex justify-center mb-5">
                  <input
                    type="text"
                    placeholder="{$t('search_by_tag')}"
                    class="input input-bordered w-full max-w-xs"
                    bind:value={$searchTag}
                  />
                </div>
                <div class="flex flex-wrap gap-8 items-center justify-center">
                  {#each publicRubricas.filter(rubrica => rubrica.course?.includes($searchTag) || $searchTag === '') as rubrica (rubrica.id)}
                    <div class="flex flex-col h-44 w-[25vw] mb-2">
                      <div class="bg-secondary-500 dark:bg-dark-secondary h-32 m-3 rounded-lg shadow-md hover-up">
                        <div class="flex m-4 inset-0 h-full">
                          <div class="text-bg-200 font-bold p-2 rounded mb-2 w-4/5 h-min">
                            #03 Curso(s) <br/>
                            #15 Disciplina(s) <br/>
                            #20 Avaliações
                          </div>
                          <div class="flex flex-col items-end inset-0 ml-4 gap-y-4">
                            <button id="r_view_btn" on:click={() => visualizarRubrica(rubrica.id)} class="pb-1 bg-primary-500 hover:bg-primary-700 w-8 h-8 text-white rounded-full">
                              <span class="text-xl font-bold">+</span>
                            </button>
                          </div>
                        </div>
                      </div>
                      <p class="text-center text-primary-500 font-semibold">
                          {rubrica.model_name ? rubrica.model_name : $t('blank_rubric_name')}
                      </p>
                    </div>
                  {/each}
                </div>
              </svelte:fragment>
            </AccordionItem>
          </Accordion>
        </section>
      </div>
      <Drawer></Drawer>
    </div>
  </div>
  <Footer></Footer>
  
  <Modal modalId={"confirm_modal"} modalFunction={removerRubrica} modalTitle={$t('modal_delete_title')} modalMessage={$t('modal_delete_message')} modalButton={$t('modal_delete_btn')} />
  <dialog id="visualizar_modal" class="modal">
    <div class="w-[85%] bg-surface-400 dark:bg-dark-surface p-6 m-2 flex flex-col items-center justify-center relative">
      <h3 class="text-lg font-bold">{$t('view_rubric')}</h3>
      {#if rubricaVisualizar}
        <ModalRubricVisualizar docId={rubricaVisualizar} />
      {:else}
        <p>{$t('loading_rubric')}</p>
      {/if}
      <div class="modal-action">
        <button class="btn bg-secondary-200 dark:bg-dark-secondary" on:click={() => document.getElementById('visualizar_modal').close()}>{$t('close')}</button>
        <button class="btn bg-primary-500 text-white" on:click={copiarERedirecionarRubrica}>{$t('edit_rubric')}</button>
      </div>
    </div>
  </dialog>
</main>

<style>
  .hover-up {
      transition: transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out;
  }

  .hover-up:hover {
      transform: scale(1.01);
      box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  }

</style>