<script lang="ts">
  import { page } from '$app/stores';
  import Breadcrumbs from '$lib/components/Breadcrumbs.svelte';
  import Footer from '$lib/components/Footer.svelte';
  import NavBar from '$lib/components/NavBar.svelte';
  import Drawer from '$lib/components/Drawer.svelte';
  import GroupCard from '$lib/components/majors/GroupCard.svelte';
  import { goto } from '$app/navigation';
  import { t } from 'svelte-i18n';
  //@ts-ignore
  import IoMdPersonAdd from 'svelte-icons/io/IoMdPersonAdd.svelte'
  import { enhance } from '$app/forms';
  import UngroupedStudentCard from '$lib/components/majors/UngroupedStudentCard.svelte';
  
  let classes: { 
        course_id: string, course_semester: number, course_year: number, professors: any[], students: any[]
      };
  let students: {
     id: string, email: string, nome: string, matricula: string, sobrenome: string
  }[];
  let groups: { id: string; group_id: string, student_ids: string[] }[] = [];

  let course_name: string;
  let class_id: string;
  let professorId: string;
  let currentStudent: { studentId:string, nome: string, sobrenome: string } | null = null;

  $: {
    if ($page.data) {
      classes = $page.data.classes; // Acesse o objeto classes diretamente
      course_name = $page.data.course_name; // Acesse course_name diretamente
      students = $page.data.students; // Acesse students diretamente
      class_id = $page.data.class_id; // Acesse o class_id diretamente
      professorId = $page.data.professorId; // Acesse o professorId diretamente
      groups = $page.data.groups; // Acesse o objeto groups diretamente
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
          <div class="h-2 flex justify-center text-center"> <!-- Bloco de Texto Principal 1 -->
            <h1 class="text-2xl font-bold text-primary-400"> Gerenciador de Grupos</h1>
          </div>
          <div class="h-2 flex justify-center text-center"> <!-- Bloco de Texto Principal 2 -->
            <h2 class="text-xl mt-6 font-bold text-primary-500">{$t('course')} - {course_name} {classes.course_semester}. {$t('semester')} - {classes.course_year}</h2>
          </div>
          <section class="container mx-auto mt-20 mb-10 min-h-[50vh]">  
            <!-- Responsive Container (recommended) -->
            <div class="table-container">
              <div class="w-full mb-2 flex justify-between flex-nowrap">
                <form method="post" use:enhance>
                  <input type="hidden" name="class_id" value="{class_id}" />
                  <button type="submit" formaction="?/createGroup" class="hover:text-primary-200">
                    <div class="fixed right-[3vw] top-[20vh] w-min-content h-min-content bg-primary-600 rounded-2xl p-1 pl-2 pr-2 flex justify-center flex-nowrap">
                      <div class="w-10 h-10 mr-3"><IoMdPersonAdd/></div>
                      <p class="font-bold mt-2">Novo Grupo</p>
                    </div>
                  </button>
                </form>
              </div>
            </div> 
            <div class="flex flex-wrap justify-start gap-3">
              {#each groups as group (group.id)}
                <GroupCard group_id={group.group_id} gid_ref={group.id} student_ids={group.student_ids} class_id={class_id} />
              {/each}
                <UngroupedStudentCard class_id={class_id} groups={groups} />
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