<script lang="ts">
    import { doc, getDoc } from "firebase/firestore";
    import { db } from "$lib/firebase";
    import { onMount } from "svelte";
    import { writable } from "svelte/store";
    import { t } from "svelte-i18n";
  
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
  
    onMount(async () => {
      fetchRubric(docId);
    });
  </script>
  
  {#if $rubric}
    <div class="max-w-[100%] max-h-[68vh] overflow-x-auto overflow-y-auto">
      <table class="table-fixed border-collapse mt-5">
        <thead class="table-header-group bg-secondary-500 dark:bg-dark-secondary text-md">
          <tr>
            <th class="border border-tertiary-500 border-solid">{$t('criterion')}</th>
            {#each $rubric.performance_levels as level}
              <th class="border border-tertiary-500 border-solid p-4">
                {level.name}
                <br />
                {level.value} {$t('points')}
              </th>
            {/each}
          </tr>
        </thead>
        <tbody class="table-row-group text-center">
          {#each $rubric.criteria as criterion}
            <tr class="transition-all">
              <td class="border border-tertiary-500 bg-secondary-500 border-solid p-2 dark:bg-dark-secondary">
                {criterion.name}
              </td>
              {#each criterion.descriptors as descriptor}
                <td class="border border-tertiary-500 border-solid p-0.5 max-w-32 min-w-32 break-words">
                  {descriptor ? descriptor : ""}
                </td>
              {/each}
            </tr>
          {/each}
        </tbody>
      </table>
    </div>
  {:else}
    <p>{$t('loading_rubric')}</p>
  {/if}
  
  <style>
    th, td {
      max-width: 13.4vw;
      min-width: 13.4vw;
    }
  </style>