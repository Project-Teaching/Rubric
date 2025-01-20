<script lang="ts">
    import { goto } from '$app/navigation';
    export let class_id: any, course_name: string, major_name: string, course_semester: number | undefined, course_year: number | undefined;

    function handleDisciplineClick(course_name: string, class_id: string) {
      goto(`/cursos/${course_name}?class_id=${class_id}`);
    }
</script>

<div id="course_card_div" class="flex flex-col h-44 w-[25vw]">
    <div 
    class="bg-secondary-500 dark:bg-dark-secondary h-36 m-3 rounded-lg shadow-md hover-up"
    role="button" 
    tabindex="0" 
    on:click={() => handleDisciplineClick(course_name, class_id)}
    on:keydown={(e) => e.key === "Enter" && handleDisciplineClick(course_name, class_id)}>
      <div class="flex m-4 inset-0 h-full">
        <div class="text-bg-200 font-bold p-2 rounded mb-2 mt-3 w-full h-min justify-center flex flex-wrap">
          <p class="text-primary-700">{course_name.toUpperCase()} <br/></p>
          <p class="dark:text-secondary-500">{major_name.toUpperCase()} <br/></p>
          <p class="text-secondary-800 dark:text-secondary-700">{course_semester}. SEMESTRE - {course_year}</p>
        </div>
      </div>
    </div>
  </div>

  <style>
    .hover-up {
      transition: transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out;
    }
  
    .hover-up:hover {
      transform: scale(1.01);
      box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
    }
  </style>