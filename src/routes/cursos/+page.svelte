<script lang="ts">
  import { page } from '$app/stores';
  import NavBar from "$lib/components/NavBar.svelte";
  import Footer from "$lib/components/Footer.svelte";
  import Breadcrumbs from "$lib/components/Breadcrumbs.svelte";
  import Drawer from '$lib/components/Drawer.svelte';
  import { goto } from '$app/navigation';
  import { doc, deleteDoc } from 'firebase/firestore';
  import { db } from '$lib/firebase'; // Ajuste o caminho conforme sua configuração

  let rubricas: { 
        id: string, uid: string, major: string, course: string, performance_levels:any[], criteria: any[], model_name: string
      }[]; 

  let rubricaParaRemover: string | null = null;

  $: {
    if ($page.data && $page.data.rubricas) {
      rubricas = $page.data.rubricas;
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
          <h1 class="text-2xl font-bold text-primary-500">Cursos e Disciplinas</h1>
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
          <div class="flex flex-wrap gap-8">
            {#each rubricas as rubrica (rubrica.id)}
              <div class="flex flex-col h-44 w-[25vw] mb-2">
                <div class="bg-secondary-500 dark:bg-dark-secondary h-32 m-3 rounded-lg shadow-md hover-up">
                  <div class="flex m-4 inset-0 h-full">
                    <div class="text-bg-200 font-bold p-2 rounded mb-2 w-4/5 h-min">
                      N° de Curso(s): 3 <br/>
                      N° de Disciplina(s): 15 <br/>
                      N° de Avaliações: 20
                    </div>
                  </div>

                </div>
                <p class="text-center text-primary-500 font-semibold">
                    {rubrica.model_name ? rubrica.model_name : "Modelo Temporariamente Não-Nomeado"}
                </p>
              </div>
            {/each}
        </section>
      </div>
      <Drawer></Drawer>
    </div>
  </div>
  <Footer></Footer>
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