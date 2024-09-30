<script lang="ts">
  import { page } from '$app/stores';
  import EditRubric from '$lib/components/rubric/EditRubric.svelte';
  import NavBar from "$lib/components/NavBar.svelte";
  import Footer from "$lib/components/Footer.svelte";
  import Drawer from '$lib/components/Drawer.svelte';
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
              <h1 class="text-2xl font-bold text-primary-500">Rubrica de Avaliação Modelo Personalizado</h1>
            </div>
            
            {#if docId}
            <EditRubric docId={docId} />
          {:else}
            <p>Criando rubrica...</p>
          {/if}
          </div>
          <Drawer></Drawer>
        </div>
      </div>
      <Footer></Footer>
    </main>
    
    