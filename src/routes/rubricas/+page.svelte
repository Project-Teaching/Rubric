<script lang="ts">
  import { page } from "$app/stores";
  import NavBar from "$lib/components/NavBar.svelte";
  import Footer from "$lib/components/Footer.svelte";
  import Breadcrumbs from "$lib/components/Breadcrumbs.svelte";
  import Drawer from "$lib/components/Drawer.svelte";
  import Modal from "$lib/components/Modal.svelte";
  import { goto } from "$app/navigation";
  import { doc, deleteDoc, addDoc, collection, getDoc, updateDoc } from "firebase/firestore";
  import { db } from "$lib/firebase"; // Ajuste o caminho conforme sua configuração
  import { t } from "svelte-i18n";
  import Shepherd from "shepherd.js";
  import { onMount } from "svelte";

  let tour: any;

  let rubricas: {
    id: string;
    uid: string;
    major: string;
    course: string;
    performance_levels: any[];
    criteria: any[];
    model_name: string;
    version: number;
    public: boolean;
    original_model: string;
    finished: boolean;
  }[];

  let editingRubricas: {
    id: string;
    uid: string;
    major: string;
    course: string;
    performance_levels: any[];
    criteria: any[];
    model_name: string;
    version: number;
    public: boolean;
    original_model: string;
    finished: boolean;
  }[];

  let rubricaParaRemover: string | null = null;

  $: {
    if ($page.data) {
      rubricas = $page.data.rubricas;
      editingRubricas = $page.data.editingRubricas;
    }
  }

  
  async function copyRubric(rubricId: string) {
    const docRef = doc(db, "rubrics", rubricId);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      const data = docSnap.data();

      // Verifica se a rubrica já está no modo de edição
      if (!data.finished) {
        // Redireciona para a página de edição da rubrica atual
        goto(`/rubricas/${rubricId}/editar modelo`);
        return;
      }

      await updateDoc(docRef, { public: false });

      const newVersion = data.version + 1;

      // Cria uma nova rubrica com a nova versão
      const newRubric = {
        ...data,
        version: newVersion,
        finished: false,
        original_model: rubricId,
      };

      // Adiciona a nova rubrica ao Firestore
      const newDocRef = await addDoc(collection(db, "rubrics"), newRubric);
      const newDocId = newDocRef.id;

      // Redireciona para a página de edição da nova rubrica
      goto(`/rubricas/${newDocId}/editar modelo`);
    } else {
      console.error("Rubrica não encontrada!");
    }
  }

  // Função para redirecionar para a página de edição
  function editarRubrica(id: string) {
    copyRubric(id);
  }

  // Função para criar um novo modelo de rubrica
  function criarNovaRubrica() {
    goto("/rubricas/criar modelo");
  }

  // Função para abrir o modal
  function abrirModal(id: string) {
    rubricaParaRemover = id;
    const modal = document.getElementById("confirm_modal");
    if (modal) {
      // @ts-ignore
      modal.showModal();
    }
  }

  // Função para remover uma rubrica
  async function removerRubrica() {
    if (rubricaParaRemover) {
      try {
        // Remove a rubrica do estado local
        rubricas = rubricas.filter(
          (rubrica) => rubrica.id !== rubricaParaRemover
        );

        // Remove o documento do Firestore
        const rubricDocRef = doc(db, "rubrics", rubricaParaRemover);
        await deleteDoc(rubricDocRef);

        // Notifique o usuário ou atualize o estado se necessário
        console.log(
          `Rubrica com id ${rubricaParaRemover} removida com sucesso.`
        );
      } catch (error) {
        console.error("Erro ao remover a rubrica: ", error);
      } finally {
        // Feche o modal
        const modal = document.getElementById("confirm_modal");
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
        },
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
        },
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
        },
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
        },
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
            await goto("/rubricas/criar modelo?tour_active=true");
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
    if ($page.url.searchParams.get("tour_active")) {
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
        <div class="h-2 flex justify-center">
          <!-- Bloco de Texto Principal 1 -->
          <h1 id="rm_title" class="h-8 text-2xl font-bold text-primary-500">
            {$t("rubric_manager_title1")}
          </h1>
        </div>
        <section class="container mx-auto mt-10">
          <!-- svelte-ignore a11y-missing-content -->
          <h1 class="text-3xl font-bold mb-5 text-center"></h1>
          {#if rubricas?.length === 0 && editingRubricas?.length === 0}
            <p class="text-center mb-10">
              {$t("rubric_manager_no_rubric")}
              <br />
              {$t("rubric_manager_no_rubric_pt2")}
            </p>
          {/if}

          <div class="flex justify-center mb-5">
            <button
              class="btn variant-filled-primary text-white dark:text-white py-2 px-4 rounded"
              id="search_rm_btn">{$t("rubric_manager_search_btn")}</button
            >
          </div>
          <div class="flex justify-center mb-5">
            <h1 class="text-2xl font-bold mb-4">{$t("rubric_published")}</h1>
          </div>

          <div class="flex flex-wrap gap-8 items-center justify-center">
            {#each rubricas as rubrica (rubrica.id)}
              <div class="flex flex-col h-44 w-[25vw] mb-2">
                <div
                  class="bg-secondary-500 dark:bg-dark-secondary h-32 m-3 rounded-lg shadow-md hover-up"
                >
                  <div class="flex m-4 inset-0 h-full">
                    <div
                      class="text-bg-200 font-bold p-2 rounded mb-2 w-4/5 h-min"
                    >
                      #03 Curso(s) <br />
                      #15 Disciplina(s) <br />
                      #20 Avaliações
                    </div>
                    <div class="flex flex-col items-end inset-0 ml-4 gap-y-4">
                      <button
                        id="r_remove_btn"
                        on:click={() => abrirModal(rubrica.id)}
                        class="pb-1 bg-error-500 hover:bg-error-900 w-8 h-8 text-white rounded-full"
                      >
                        <span class="text-xl font-bold">x</span>
                      </button>
                      <button
                        id="r_edit_btn"
                        on:click={() => editarRubrica(rubrica.id)}
                        class="btn variant-filled-primary text-white dark:text-white w-12 h-12 rounded-full flex items-center justify-center"
                      >
                        <span class="text-2xl font-bold">+</span>
                      </button>
                    </div>
                  </div>
                </div>
                <p class="text-center text-primary-500 font-semibold">
                  {rubrica.model_name
                    ? rubrica.model_name
                    : $t("blank_rubric_name")}
                </p>
              </div>
            {/each}
            <div class="flex flex-col h-44 w-[25vw] mb-2">
              <div
                class="bg-secondary-500 dark:bg-dark-secondary h-32 m-3 rounded-lg shadow-md hover-up"
              >
                <div class="flex justify-end items-end m-4 inset-0">
                  <div class="mt-12">
                    <button
                      id="r_create_btn"
                      on:click={criarNovaRubrica}
                      class="bg-primary-500 text-white w-12 h-12 rounded-full flex items-center justify-center shadow-lg"
                    >
                      <span class="text-2xl font-bold">+</span>
                    </button>
                  </div>
                </div>
              </div>
              <p class="text-center text-primary-500 font-semibold">
                {$t("rubric_manager_create_btn")}
              </p>
            </div>
          </div>
        </section>
        <section class="container mx-auto mt-10">
          <!-- svelte-ignore a11y-missing-content -->
          <h1 class="text-3xl font-bold mb-5 text-center"></h1>

          <div class="flex justify-center mb-5">
            <h1 class="text-2xl font-bold mb-4">{$t("rubric_editing")}</h1>
          </div>

          <div class="flex flex-wrap gap-8 items-center justify-center">
            {#each editingRubricas as rubrica (rubrica.id)}
              <div class="flex flex-col h-44 w-[25vw] mb-2">
                <div
                  class="bg-secondary-500 dark:bg-dark-secondary h-32 m-3 rounded-lg shadow-md hover-up"
                >
                  <div class="flex m-4 inset-0 h-full">
                    <div
                      class="text-bg-200 font-bold p-2 rounded mb-2 w-4/5 h-min"
                    >
                      #03 Curso(s) <br />
                      #15 Disciplina(s) <br />
                      #20 Avaliações
                    </div>
                    <div class="flex flex-col items-end inset-0 ml-4 gap-y-4">
                      <button
                        id="r_remove_btn"
                        on:click={() => abrirModal(rubrica.id)}
                        class="pb-1 bg-error-500 hover:bg-error-900 w-8 h-8 text-white rounded-full"
                      >
                        <span class="text-xl font-bold">x</span>
                      </button>
                      <button
                        id="r_edit_btn"
                        on:click={() => editarRubrica(rubrica.id)}
                        class="btn variant-filled-primary text-white dark:text-white w-12 h-12 rounded-full flex items-center justify-center"
                      >
                        <span class="text-2xl font-bold">+</span>
                      </button>
                    </div>
                  </div>
                </div>
                <p class="text-center text-primary-500 font-semibold">
                  {rubrica.model_name
                    ? rubrica.model_name
                    : $t("blank_rubric_name")}
                </p>
              </div>
            {/each}
            <div class="flex flex-col h-44 w-[25vw] mb-2">
              <div
                class="bg-secondary-500 dark:bg-dark-secondary h-32 m-3 rounded-lg shadow-md hover-up"
              >
                <div class="flex justify-end items-end m-4 inset-0">
                  <div class="mt-12">
                    <button
                      id="r_create_btn"
                      on:click={criarNovaRubrica}
                      class="bg-primary-500 text-white w-12 h-12 rounded-full flex items-center justify-center shadow-lg"
                    >
                      <span class="text-2xl font-bold">+</span>
                    </button>
                  </div>
                </div>
              </div>
              <p class="text-center text-primary-500 font-semibold">
                {$t("rubric_manager_create_btn")}
              </p>
            </div>
          </div>
        </section>
      </div>
      <Drawer></Drawer>
    </div>
  </div>
  <Footer></Footer>

  <Modal
    modalId={"confirm_modal"}
    modalFunction={removerRubrica}
    modalTitle={$t("modal_delete_title")}
    modalMessage={$t("modal_delete_message")}
    modalButton={$t("modal_delete_btn")}
  />

</main>

<style>
  .hover-up {
    transition:
      transform 0.2s ease-in-out,
      box-shadow 0.2s ease-in-out;
  }

  .hover-up:hover {
    transform: scale(1.01);
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  }
</style>
