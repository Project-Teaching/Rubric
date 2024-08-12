<script lang="ts">
  import { page } from '$app/stores';
  import NavBar from "$lib/components/NavBar.svelte";
  import Footer from "$lib/components/Footer.svelte";
  import Breadcrumbs from "$lib/components/Breadcrumbs.svelte";
  import { goto } from '$app/navigation';
  import { doc, deleteDoc } from 'firebase/firestore';
  import { db } from '$lib/firebase'; // Ajuste o caminho conforme sua configuração

  let rubricas: { 
        id: string, final_date: string, uid: string, major: string, course: string, performance_levels:any[], criteria: any[], model_name: string
      }[]; 

  let rubricaParaRemover: string | null = null;

  $: {
    if ($page.data && $page.data.rubricas) {
      rubricas = $page.data.rubricas;
    }
  }

  // Função para redirecionar para a página de edição
  function editarRubrica(id: string) {
      goto(`/rubricas/${id}/edit`);
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
  <title>Rubric App</title>
  <meta name="description" content="Rubric Assessment App" />
</svelte:head>

<main class="flex flex-col min-h-screen">
  <NavBar></NavBar>
  <Breadcrumbs />
  <div class="flex-grow main-content">
    <div class="drawer w-4/5">
      <input id="my-drawer" type="checkbox" class="drawer-toggle" />
      <div class="drawer-content">
        <!-- Conteúdo principal aqui -->
        <div class="h-2 flex justify-center"> <!-- Bloco de Texto Principal 1 -->
          <h1 class="text-2xl font-bold text-primary">Gerenciador de Rubricas de Avaliação</h1>
        </div>
        <section class="container mx-auto mt-10">
          <!-- svelte-ignore a11y-missing-content -->
          <h1 class="text-3xl font-bold mb-5 text-center"></h1>
          {#if rubricas?.length === 0}
            <p class="text-center mb-10">
              Parece que você não tem nenhuma rubrica de avaliação criada ainda!
              <br />
              Logo abaixo você verá alguns modelos de nosso sistema, ou poderá criar sua rubrica do zero!
            </p>
          {/if}
        
          <div class="flex justify-center mb-5">
            <button class="btn btn-primary text-white py-2 px-4 rounded">Pesquisar Modelos</button>
          </div>
        
          <div class="flex flex-wrap gap-8">
            {#each rubricas as rubrica (rubrica.id)}
              <div class="flex flex-col h-60 w-[25vw] mb-2">
                <div class="bg-secondary h-52 p-4 rounded-lg shadow-md">
                  <div class="flex  justify-between inset-0">
                    <div class="bg-base-200 text-accent font-bold p-2 rounded mb-2 w-4/5">
                      N° de Curso(s): 3 <br/>
                      N° de Disciplina(s): 5 <br/>
                      N° de Avaliações: 10
                    </div>
                    <button on:click={() => abrirModal(rubrica.id)} class="pb-1 bg-error-content hover:bg-error w-8 h-8 text-white rounded-full">
                      <span class="text-xl font-bold">x</span>
                    </button>
                  </div>
                  <div class="flex justify-end items-end inset-0 p-2 mt-8">
                    <button on:click={() => editarRubrica(rubrica.id)} class="btn btn-primary text-white w-12 h-12 rounded-full flex items-center justify-center">
                      <span class="text-2xl font-bold">+</span>
                    </button>
                  </div>
                </div>
                <p class="text-center mt-2 text-primary font-semibold">
                    {rubrica.model_name ? rubrica.model_name : "Modelo Temporariamente Não-Nomeado"}
                </p>
              </div>
            {/each}
            <div class="flex flex-col h-60 w-[25vw] mb-2">
              <div class="bg-secondary h-52 p-4 rounded-lg shadow-md">
                <div class="flex justify-end items-end inset-0 p-2 mt-[17vh]">
                  <button on:click={criarNovaRubrica} class="bg-primary text-white w-12 h-12 rounded-full flex items-center justify-center shadow-lg">
                    <span class="text-2xl font-bold">+</span>
                  </button>
                </div>
              </div>
              <p class="text-center mt-2 text-primary font-semibold">
                Crie seu próprio modelo personalizado
              </p>
            </div>
          </div>
        </section>
      </div>
      <div class="drawer-side">
        <label for="my-drawer" aria-label="close sidebar" class="drawer-overlay"></label>
        <ul class="menu bg-base-200 text-base-content min-h-full w-80 p-4 font-bold drawer-text">
          <li><a href="/">Gerenciador de Rubricas</a></li>
          <li><a href="/">Cursos e Disciplinas</a></li>
          <li><a href="/">Modelos de Rubricas</a></li>
          <li><a href="/">Suporte</a></li>
        </ul>
      </div>
    </div>
  </div>
  <Footer></Footer>
  
  <!-- Modal de confirmação -->
  <dialog id="confirm_modal" class="modal">
    <div class="modal-box">
      <h3 class="text-lg font-bold">Confirmar Exclusão</h3>
      <p class="py-4">Você tem certeza que deseja remover esta rubrica? Esta ação não pode ser desfeita.</p>
      <div class="modal-action">
        <button on:click={removerRubrica} class="btn btn-error">Excluir</button>
        <form method="dialog">
          <!-- if there is a button in form, it will close the modal -->
          <button class="btn btn-secondary">Cancelar</button>
        </form>
      </div>
    </div>
  </dialog>
</main>
