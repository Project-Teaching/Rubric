<script lang="ts">
  import { page } from '$app/stores';
  import EditRubric from '$lib/components/rubric/EditRubric.svelte';
  import NavBar from "$lib/components/NavBar.svelte";
  import Footer from "$lib/components/Footer.svelte";
  import Drawer from '$lib/components/Drawer.svelte';
  import Breadcrumbs from "$lib/components/Breadcrumbs.svelte";
  import { t } from 'svelte-i18n';
  import Shepherd from 'shepherd.js';
  import { onMount } from 'svelte';
  import { goto } from '$app/navigation';

  let docId: string | undefined;
  let tour: any;

  // Use $page para acessar os dados retornados pelo load
  $: {
    if ($page.data && $page.data.docId) {
      docId = $page.data.docId;
      console.log("Doc ID from page data:", docId); // Verifique o valor do docId
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
      id: "rblank_step-1",
      text: $t("rblank_tour_step_1"),
      attachTo: {
        element: "#rb_title",
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
      id: "rblank_step-2",
      text: $t("rblank_tour_step_2"),
      attachTo: {
        element: "#row_add_btn",
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
      id: "rblank_step-3",
      text: $t("rblank_tour_step_3"),
      attachTo: {
        element: "#column_add_btn",
        on: "left",
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
      id: "rblank_step-4",
      text: $t("rblank_tour_step_4"),
      attachTo: {
        element: "#reset_grid_rubric_btn",
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
      id: "rblank_step-5",
      text: $t("rblank_tour_step_5"),
      attachTo: {
        element: "#rubric_model_name_label",
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
      id: "rblank_step-6",
      text: $t("rblank_tour_step_6"),
      attachTo: {
        element: "#performance_level_input",
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
      id: "rblank_step-7",
      text: $t("rblank_tour_step_7"),
      attachTo: {
        element: "#performance_level_value_input",
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
      id: "rblank_step-8",
      text: $t("rblank_tour_step_8"),
      attachTo: {
        element: "#grab_drop_btn_column",
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
      id: "rblank_step-9",
      text: $t("rblank_tour_step_9"),
      attachTo: {
        element: "#delete_column_btn",
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
      id: "rblank_step-10",
      text: $t("rblank_tour_step_10"),
      attachTo: {
        element: "#criterion_input",
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
      id: "rblank_step-11",
      text: $t("rblank_tour_step_11"),
      attachTo: {
        element: "#descriptor_cell",
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
      id: "rblank_step-12",
      text: $t("rblank_tour_step_12"),
      attachTo: {
        element: "#rubric_tags_label",
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
      id: "rblank_step-13",
      text: $t("rblank_tour_step_13"),
      attachTo: {
        element: "#save_model_rubric_btn",
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
              <h1 id="rb_title" class="h-8 text-2xl font-bold text-primary-500">{$t('create_rubric_blank_name')}</h1>
            </div>
            
            {#if docId}
            <EditRubric docId={docId} />
          {:else}
            <p>{$t('building_rubric')}</p>
          {/if}
          </div>
          <Drawer></Drawer>
        </div>
      </div>
      <Footer></Footer>
    </main>
    
    