<script lang="ts">
  import { doc, getDoc } from "firebase/firestore";
  import { db } from "$lib/firebase";
  import { onMount } from "svelte";
  import { writable } from "svelte/store";

  interface Criterion {
    name: string;
    descriptors: string[];
  }
  interface PerformanceLevel {
    name: string;
    value: number;
  }
  interface Rubric {
    model_name: string;
    course: string[];
    major: string[];
    uid: string;
    criteria: Criterion[];
    performance_levels: PerformanceLevel[];
    public: boolean;
    version: number;
    original_model: string;
    finished: boolean;
  }

  export let docId: string;

  let rubric = writable<Rubric | null>(null);
  
  async function fetchRubric(id: string) {
    const docRef = doc(db, "rubrics", id);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      rubric.set(docSnap.data() as Rubric);
    } else {
      console.log("No such document!");
    }
  }
  // Busca os dados do modelo no Firebase ao montar o componente
  onMount(async () => {
    fetchRubric(docId);
  });
</script>

{#if $rubric}
  <div class="rubric-matrix m-6 bg">
    <!-- MATRIZ DA RUBRICA -->
    <div class="max-w-[100vw] max-h-[68vh] overflow-x-auto overflow-y-auto">
      <table class="table-fixed border-collapse mt-5">
        <thead class="table-header-group bg-secondary-500 dark:bg-dark-secondary text-md">
          <tr>
            <th
              class="drag-drop-row-cell border border-tertiary-500 border-solid"
            ></th>
            <!-- PERFORMANCE LEVELS -->
            <th class="border border-tertiary-500 border-solid">Critério</th>
            {#each $rubric.performance_levels as level, colIndex}
              <th
                class="border border-tertiary-500 border-solid p-4"
              >
                <div class="flex flex-row flex-nowrap justify-between items-center cursor-grab w-full h-4 mb-2">
                </div>
                {level.name}
                <br />
                {level.value} pontos
              </th>
            {/each}
          </tr>
        </thead>
        <!-- CRITÉRIOS -->
        <tbody class="table-row-group text-center">
          {#each $rubric.criteria as criterion, cIndex}
            <tr class="transition-all">
              <td
                class="drag-drop-row-cell border border-tertiary-500 border-solid bg-secondary-500 dark:bg-dark-secondary"
              >
              </td>
              <!-- Ícone de drag-and-drop -->
              <td class="border border-tertiary-500 border-solid p-2">
            {criterion.name}
              </td>
              {#each criterion.descriptors as descriptor, dIndex}
                <td
                  class="border border-tertiary-500 border-solid p-0.5 max-w-32 min-w-32 break-words"
                >
                  <div
                    class="w-full min-h-20 max-h-20 p-0.5 overflow-auto text-center text-sm bg-secondary-500 dark:bg-dark-secondary font-medium"
                  >
                    {descriptor ? descriptor : ""}
                  </div>
                </td>
              {/each}
            </tr>
          {/each}
        </tbody>
      </table>
    </div>
  </div>
{:else}
  <p>Carregando rubrica...</p>
{/if}

<style>
  th, td {
    max-width: 13.4vw;
    min-width: 13.4vw;
  }


</style>
