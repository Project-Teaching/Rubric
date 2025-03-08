<script lang="ts">
  import { page } from '$app/stores';
  import Breadcrumbs from '$lib/components/Breadcrumbs.svelte';
  import Footer from '$lib/components/Footer.svelte';
  import NavBar from '$lib/components/NavBar.svelte';
  import Drawer from '$lib/components/Drawer.svelte';
  import TextInput from '$lib/components/TextInput.svelte';
  import { goto } from '$app/navigation';
  import { t } from "svelte-i18n";
  let class_id: string;
  let rubric_model_id: string;
  let uid: string;
  let classes: { 
        course_id: string, course_semester: number, course_year: number, professors: any[], students: any[]
      };
  let major: {
    major_id: string, major_name: string, major_courses: any[]
  }
  let rubric: {
    uid: string, major: string, course: string, performance_levels:any[], criteria: any[], model_name: string, public: boolean, finished: boolean, version: number, original_model: string
  }

  $: {
    if ($page.data) {
      classes = $page.data.class; // Acesse o objeto classes diretamente
      class_id = $page.data.class_id; // Acesse o class_id diretamente
      rubric_model_id = $page.data.rubric_model_id; // Acesse o rubric_model_id diretamente
      uid = $page.data.uid; // Acesse o uid diretamente
      major = $page.data.major; // Acesse o major diretamente
      rubric = $page.data.rubric; // Acesse o rubric diretamente
    }
  }
  let course_name = '';

  function voltarPagina() {
    //window.history.back();
    let course_name = major.major_courses.find(course => course.c_id == classes.course_id).c_name;
    goto(`/cursos/${course_name}?class_id=${class_id}`);
  }

  function getCourseName() {
    return new Promise((resolve) => {
      const course = major.major_courses.find(course => course.c_id == classes.course_id);
      resolve(course ? course.c_name : null); // Resolve com o nome do curso ou null
    });
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
          <div class="h-2 flex justify-center text-center"> <!-- Bloco de Texto Principal 1 -->
            <h1 class="text-2xl font-bold text-primary-500">{$t('nova avaliação')}</h1>
          </div>
          <section class="container mx-auto mt-16 mb-10 min-h-[50vh]">  
            <div class="flex justify-center items-center">
            {#await getCourseName() then course_name}
              <form class="form w-[50%] h-[65vh] justify-center bg-secondary-500 dark:bg-dark-secondary p-5 rounded-xl" method="post" action="/cursos/{course_name}?class_id={class_id}">
                <!-- HIDDEN VALUES PADRÃO -->
                <input type="hidden" name="class_id" value="{class_id}" />
                <input type="hidden" name="rubric_model_id" value="{rubric_model_id}" />
                <input type="hidden" name="professor_id" value="{uid}" />

                <!-- INFO DA EVALUATION -->
                <div class="flex justify-center items-center w-full p-4">
                  <TextInput input_type="text" label_name={$t('evaluations_table_evaluation_name')} input_name="evaluation_name" placeholder={$t('evaluations_table_evaluation_name')} input_value_true="" input_value_ds="" disabled="false" />
                  <TextInput input_type="date" label_name={$t('evaluation_date')} input_name="evaluation_date" placeholder={$t('evaluation_date')} input_value_true="" input_value_ds="" disabled="false" />
                  <label class="label ml-4 w-[90%]">
                    <span class="font-semibold">{$t('group_evaluation')}</span>
                    <select class="select border-none w-[70%] bg-gray-100 dark:bg-stone-800 rounded-md p-2 mr-2" name="group_evaluation">
                        <option value="false">{$t('no')}</option>
                        <option value="true">{$t('yes')}</option>
                    </select>
                  </label>
                </div>
                <!-- INFO DA EVALUATION VISUAL/HIDDEN TRUE VALUES -->
                <div class="flex justify-center items-center w-full p-4">
                  <TextInput input_type="text" label_name={$t('major')} input_name="evaluation_major" placeholder="Curso" input_value_true="{major.major_id}" input_value_ds="{major.major_name}" disabled="true" />
                  <TextInput input_type="text" label_name={$t('course')} input_name="evaluation_course" placeholder="Disciplina" input_value_true="{classes.course_id}" input_value_ds="{course_name}" disabled="true" />
                </div>
                <div class="flex justify-center items-center w-full p-4">
                  <label class="label ml-4 w-[90%]">
                    <span class="font-semibold">{$t('home_page_model')}</span>
                    <input type="text" value="{rubric.model_name}" class="input bg-secondary-200 dark:bg-dark-surface border-b-2 border-t-0 border-l-0 border-r-0 rounded-md w-[90%]" disabled />
                  <input type="hidden" value="{rubric_model_id}" name="rubric_model_id" />
                  </label>
                  <label class="label ml-4 w-[90%]">
                    <span class="font-semibold">{$t('version')}</span>
                    <input type="text" value="{rubric.version}" class="input bg-secondary-200 dark:bg-dark-surface border-b-2 border-t-0 border-l-0 border-r-0 rounded-md w-[90%]" disabled />
                  </label>
                </div>
                <div class="flex justify-between font-semibold mt-6 items-center w-full p-4">
                  <button type="button" on:click={voltarPagina} class="btn bg-primary-800 w-32 ml-6">{$t('back')}</button>
                  <button type="submit" class="btn bg-primary-500 w-40 mr-6">{$t('create_evaluation')}</button>
                </div>
              </form>
              {:catch error}
                <p>{$t('major_error')}: {error.message}</p>
              {/await}
          </div>
          </section>
        </div>
        <Drawer></Drawer>
      </div>
    </div>
    <Footer></Footer>
  </main>
  
  <style>
  
  </style>