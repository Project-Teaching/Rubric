<script lang="ts">
  import NavBar from "$lib/components/NavBar.svelte";
  import Footer from "$lib/components/Footer.svelte";
  import Drawer from "$lib/components/Drawer.svelte";
  import { onMount } from "svelte";
  import Shepherd from 'shepherd.js';
  import { t } from 'svelte-i18n';
  import { tick } from 'svelte';

  let tour;
  
  const startTour = async () => {

    tour = new Shepherd.Tour({
      defaultStepOptions: {
        classes: "dark:text-white shadow-md bg-surface-500 text-black",
        scrollTo: true,
      },
      useModalOverlay: true,
    });

    tour.addStep({
      id: "step-1",
      text: $t("tour_step_1"),
      attachTo: {
        element: ".p-content",
        on: "bottom",
      },
      buttons: [
        {
          text: "Próximo",
          action: tour.next,
        },
      ],
    });

    tour.addStep({
      id: "step-2",
      text: $t("tour_step_2"),
      attachTo: {
        element: ".rubric-model-preview-text",
        on: "bottom",
      },
      buttons: [
        {
          text: "Próximo",
          action: tour.next,
        },
      ],
    });

    tour.addStep({
      id: "step-3",
      text: $t("tour_step_3"),
      attachTo: {
        element: "#language-dropdown",
        on: "bottom",
      },
      buttons: [
        {
          text: "Próximo",
          action: tour.next,
        },
      ],
    });

    tour.addStep({
      id: "step-4",
      text: $t("tour_step_4"),
      attachTo: {
        element: "#theme-switcher",
        on: "bottom",
      },
      buttons: [
        {
          text: "Próximo",
          action: tour.next,
        },
      ],
    });

    tour.addStep({
      id: "step-5",
      text: $t("tour_step_5"),
      attachTo: {
        element: ".drawer-button",
        on: "right",
      },
      buttons: [
        {
          text: "Próximo",
          action: tour.next,
        },
      ],
    });

    tour.start();
  };

  onMount(() => {
    startTour(); // Inicia o tour após a montagem
  });
</script>

<svelte:head>
  <title>Rubric Pro</title>
</svelte:head>

  <main class="flex dark:bg-dark-surface flex-col min-h-screen">
    <NavBar></NavBar>
    <div class="flex-grow main-content">
      <div class="drawer">
        <input id="my-drawer" type="checkbox" class="drawer-toggle" />
        <div class="drawer-content">
          <!-- Conteúdo principal aqui -->
          <div class="p-content"> <!-- Bloco de Texto Principal 1 -->
            <h1 class="text-2xl font-bold text-primary-500">{$t('home_page_title1')}</h1>
            <p class="py-4 text-base">{$t('home_page_s1')}</p>
          </div>
          <div class="m-page-content"> <!-- Bloco de Texto Principal 2 -->
            <div class="p-content">
              <h1 class="text-2xl font-bold text-primary-500">{$t('home_page_title2')}</h1>
              <p class="py-4 text-base">{$t('home_page_s2')}</p>
              <a href="/rubricas" class="text-primary-500 font-bold text-base">&lt; {$t('home_page_btn2')} &gt;</a>
            </div>
            <div class="p-content">
              <h1 class="text-2xl font-bold text-primary-500">{$t('home_page_title3')}</h1>
              <p class="py-4 text-base">{$t('home_page_s3')}</p>
            </div>
          </div>
          <div class="p-content"> <!-- Bloco de Rubric Models -->
            <div class="stack model-preview-group">
              <div class="card-daisy bg-secondary-500 text-primary-500-content shadow-md rubric-model-preview rmp-1">
                <div class="card-body">
                  <h2 class="card-title">{$t('home_page_models')}</h2>
                </div>
              </div>
              <div class="card-daisy bg-secondary-500 text-primary-500-content shadow-md rubric-model-preview rmp-2 dark:bg-orange-200">
                <div class="card-body">
                  <h2 class="card-title">{$t('home_page_model')}</h2>
                </div>
              </div>
              <div class="card-daisy bg-secondary-500 text-primary-500-content shadow-md rubric-model-preview rmp-3 dark:bg-dark-tertiary">
                <div class="card-body">
                  <h2 class="card-title">{$t('home_page_model')}</h2>
                </div>
              </div>
            </div>
            <div class="rubric-model-preview-text">
              <h1 class="text-2xl font-bold text-primary-500">{$t('home_page_start')}</h1>
              <a href="/rubricas/" class="text-primary-500 font-bold text-base">{$t('home_page_first_rubric')}</a>
            </div>
          </div> 
        </div>
        <Drawer></Drawer>
      </div>
    </div>
    <Footer></Footer>
  </main>