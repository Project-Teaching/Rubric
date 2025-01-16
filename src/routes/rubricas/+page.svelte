<script lang="ts">
  import { page } from '$app/stores';
  import NavBar from "$lib/components/NavBar.svelte";
  import Footer from "$lib/components/Footer.svelte";
  import Breadcrumbs from "$lib/components/Breadcrumbs.svelte";
  import Drawer from '$lib/components/Drawer.svelte';
  import Modal from '$lib/components/Modal.svelte';
  import { goto } from '$app/navigation';
  import { doc, deleteDoc } from 'firebase/firestore';
  import { db } from '$lib/firebase'; // Ajuste o caminho conforme sua configuração
  import { t } from 'svelte-i18n';

  let rubricas: { 
        id: string, uid: string, major: string, course: string, performance_levels:any[], criteria: any[], model_name: string, version: number, public: boolean, original_model: string, finished: boolean
      }[]; 

  let rubricaParaRemover: string | null = null;

  $: {
    if ($page.data && $page.data.rubricas) {
      rubricas = $page.data.rubricas;
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
          <h1 class="text-2xl font-bold text-primary-500">{$t('rubric_manager_title1')}</h1>
        </div>
        <section class="container mx-auto mt-10">
          <!-- svelte-ignore a11y-missing-content -->
          <h1 class="text-3xl font-bold mb-5 text-center"></h1>
          {#if rubricas?.length === 0}
            <p class="text-center mb-10">
              {$t('rubric_manager_no_rubric')}
              <br />
              {$t('rubric_manager_no_rubric_pt2')}
            </p>
          {/if}
        
          <div class="flex justify-center mb-5">
            <button class="btn variant-filled-primary text-white dark:text-white py-2 px-4 rounded">{$t('rubric_manager_search_btn')}</button>
          </div>
        
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
                      <button on:click={() => abrirModal(rubrica.id)} class="pb-1 bg-error-500 hover:bg-error-900 w-8 h-8 text-white rounded-full">
                        <span class="text-xl font-bold">x</span>
                      </button>
                      <button on:click={() => editarRubrica(rubrica.id)} class="btn variant-filled-primary text-white dark:text-white w-12 h-12 rounded-full flex items-center justify-center">
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
                    <button on:click={criarNovaRubrica} class="bg-primary-500 text-white w-12 h-12 rounded-full flex items-center justify-center shadow-lg">
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
        </section>
      </div>
      <Drawer></Drawer>
    </div>
  </div>
  <Footer></Footer>
  
  <Modal modalId={"confirm_modal"} modalFunction={removerRubrica} modalTitle={$t('modal_delete_title')} modalMessage={$t('modal_delete_message')} modalButton={$t('modal_delete_btn')} />
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