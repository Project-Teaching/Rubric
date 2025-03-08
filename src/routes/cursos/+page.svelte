<script lang="ts">
  import { page } from '$app/stores';
  import NavBar from "$lib/components/NavBar.svelte";
  import Footer from "$lib/components/Footer.svelte";
  import Breadcrumbs from "$lib/components/Breadcrumbs.svelte";
  import Drawer from '$lib/components/Drawer.svelte';
  import CoursesCard from '$lib/components/majors/CoursesCard.svelte';
  import { Accordion, AccordionItem } from '@skeletonlabs/skeleton';
  // @ts-ignore
  import IoIosArrowDown from 'svelte-icons/io/IoIosArrowDown.svelte'
  // @ts-ignore
  import IoIosArrowUp from 'svelte-icons/io/IoIosArrowUp.svelte'
  import { t } from 'svelte-i18n';
  import { onMount } from 'svelte';
  import Shepherd from 'shepherd.js';
  import { goto } from '$app/navigation';

  let majors: { 
        id:string, major_id: string, major_name: string, major_courses: courses[] 
      }[]; 
  
  let classes: { 
        id: string, course_id: string, course_semester: number, course_year: number
      }[];

  let tour: any;

  interface courses { 
        c_id: string, c_name: string
      }

  $: {
    if ($page.data && $page.data.majors && $page.data.classes) {
      majors = $page.data.majors;
      classes = $page.data.classes;
    }
  }

  // Função para encontrar a turma correspondente de um curso
  const getCourseDetails = (courseId: string) => {
    return classes.find(cls => cls.course_id === courseId);
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
      id: "cm_step-1",
      text: $t("cm_tour_step_1"),
      attachTo: {
        element: "#cm_title",
        on: "right",
      },
      buttons: [
        {
          text: $t("tour_next"),
          action: tour.next,
        },
        {
          text: $t("tour_finish"),
          action: tour.complete,
        }
      ],
    });

    tour.addStep({
      id: "cm_step-2",
      text: $t("cm_tour_step_2"),
      attachTo: {
        element: "#major_title",
        on: "top",
      },
      buttons: [
        {
          text: $t("tour_next"),
          action: tour.next,
        },
        {
          text: $t("tour_back"),
          action: tour.back,
        },
        {
          text: $t("tour_finish"),
          action: tour.complete,
        }
      ],
    });

    tour.addStep({
      id: "cm_step-3",
      text: $t("cm_tour_step_3"),
      attachTo: {
        element: "#course_card_div",
        on: "top",
      },
      buttons: [
        {
          text: $t("tour_lets_go"),
          action: async () => { 
          tour.complete();
          await goto('/cursos/Teoria%20da%20Computação?class_id=YwPKmwoqCwGzzcREmGTZ&tour_active=true');
          },
        },
        {
          text: $t("tour_back"),
          action: tour.back,
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
          <h1 id="cm_title" class="h-8 text-2xl font-bold text-primary-500">{$t('majors and courses')}</h1>
        </div>
        <section class="container mx-auto mt-10">
          {#if majors?.length === 0}
            <p class="text-center mb-10">
              {$t('no majors and courses found')}
            </p>
          {/if}
          <Accordion>
          {#each majors as major (major.id)}
            <AccordionItem open>
              <svelte:fragment slot="iconClosed"><div class="w-5 text-primary-500"><IoIosArrowUp /></div></svelte:fragment>
	            <svelte:fragment slot="iconOpen"><div class="w-5 text-primary-500"><IoIosArrowDown /></svelte:fragment>
              <svelte:fragment slot="summary"><h3 id="major_title" class="text-primary-500 font-semibold mb-2 text-lg">{major.major_name}</h3></svelte:fragment>
              <svelte:fragment slot="content">
                <div class="flex flex-wrap gap-8">
                  <hr class="!border-t-2 !border-primary-400 w-full" />
                  {#each major.major_courses as course}
                    {#if getCourseDetails(course.c_id)}
                      <!-- Atribui os detalhes do curso -->
                      {#await getCourseDetails(course.c_id) then courseDetails}
                        <CoursesCard 
                          course_name={course.c_name} 
                          major_name={major.major_name} 
                          course_semester={courseDetails?.course_semester} 
                          course_year={courseDetails?.course_year}
                          class_id={courseDetails?.id} 
                        />
                      {/await}
                    {/if}
                  {/each}
                </div>
              </svelte:fragment>
            </AccordionItem>
          {/each}  
          </Accordion>      
        </section>
      </div>
      <Drawer></Drawer>
    </div>
  </div>
  <Footer></Footer>
</main>

<style>

</style>
