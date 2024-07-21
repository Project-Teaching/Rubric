<script lang="ts">
  import { page } from '$app/stores';
  import EditRubric from '$lib/components/rubric/EditRubric.svelte';
  import NavBar from "$lib/components/NavBar.svelte";
  import Footer from "$lib/components/Footer.svelte";
  import Breadcrumbs from "$lib/components/Breadcrumbs.svelte";

  let docId: string | undefined;

  // Use $page para acessar os dados retornados pelo load
  $: {
    if ($page.data && $page.data.docId) {
      docId = $page.data.docId;
      console.log("Doc ID from page data:", docId); // Verifique o valor do docId
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
              <h1 class="text-2xl font-bold text-primary">Rubrica de Avaliação Modelo Personalizado</h1>
            </div>
            
            {#if docId}
            <EditRubric docId={docId} />
          {:else}
            <p>Criando rubrica...</p>
          {/if}
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
    </main>
    
    