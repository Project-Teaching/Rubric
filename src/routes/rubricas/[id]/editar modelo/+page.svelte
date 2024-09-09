<script lang="ts">
    import EditRubric from '$lib/components/rubric/EditRubric.svelte';
    import NavBar from "$lib/components/NavBar.svelte";
    import Footer from "$lib/components/Footer.svelte";
    import Drawer from '$lib/components/Drawer.svelte';
    import Breadcrumbs from "$lib/components/Breadcrumbs.svelte";
    import type { PageData } from './$types';
    
    export let data: PageData;
  </script>
  
  <svelte:head>
    <title>Editar Rubrica</title>
  </svelte:head>
  
  <main class="flex flex-col min-h-screen dark:bg-dark-surface">
    <NavBar></NavBar>
    <Breadcrumbs />
    <div class="flex-grow main-content">
      <div class="drawer w-4/5">
        <input id="my-drawer" type="checkbox" class="drawer-toggle" />
        <div class="drawer-content">
          <div class="h-2 flex justify-center">
            <h1 class="text-2xl font-bold text-primary-500">Editar Rubrica</h1>
          </div>
          
          {#if data.docId}
            <EditRubric docId={data.docId} />
          {:else}
            <p>Carregando...</p>
          {/if}
        </div>
        <Drawer></Drawer>
      </div>
    </div>
    <Footer></Footer>
  </main>
  