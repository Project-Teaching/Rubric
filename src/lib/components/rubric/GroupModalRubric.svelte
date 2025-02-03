<script lang="ts">
  import { doc, getDoc, updateDoc, arrayUnion, writeBatch } from "firebase/firestore";
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
  export let professorId: string;
  export let evaluationId: string;
  export let groupId: string | undefined;
  export let student_ids: string[] | undefined;

  let rubric = writable<Rubric | null>(null);
  let totalScore = writable(0);
  let selectedCells = writable<{ [key: number]: number }>({});

  async function fetchRubric(id: string) {
    const docRef = doc(db, "rubrics", id);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      rubric.set(docSnap.data() as Rubric);
    } else {
      console.log("No such document!");
    }
  }

  // Atualiza a pontuação total com base nas células selecionadas
  $: {
    if ($rubric) {
      let score = 0;
      for (const [row, col] of Object.entries($selectedCells)) {
        const level = $rubric.performance_levels[col];
        if (level) {
          score += level.value;
        }
      }
      totalScore.set(score);
    }
  }

  // Busca os dados do modelo no Firebase ao montar o componente
  onMount(async () => {
    fetchRubric(docId);
  });

  function selectCell(row: number, col: number) {
    selectedCells.update((cells) => ({ ...cells, [row]: col }));
  }

  async function updateEvaluationResultG(student_ids: string[] | undefined) {
  if (!$rubric) {
    console.error("Rubrica não encontrada.");
    return;
  }

  try {
    const evaluationRef = doc(db, "evaluations", evaluationId);
    const batch = writeBatch(db); // Cria um batch para otimizar a escrita

    for (const studentId of student_ids ?? []) {
      const evaluation_results = [{
        evaluation_comment: "",
        evaluation_notes: "",
        group_id: groupId,
        student_id: studentId,
        score: $totalScore,
        professor_id: professorId,
        rubric_evaluation: $rubric.criteria
          .map((criterion, cIndex) => {
            const levelIndex = $selectedCells[cIndex];
            return levelIndex !== undefined
              ? { criterion_number: cIndex + 1, level_number: levelIndex + 1 }
              : null;
          })
          .filter(Boolean)
      }];

      // Adiciona a atualização ao batch
      batch.update(evaluationRef, {
        evaluation_result: arrayUnion(...evaluation_results),
      });
    }

    // Envia todas as atualizações de uma vez
    await batch.commit();
    console.log("Avaliações do grupo atualizadas com sucesso.");
  } catch (error) {
    console.error("Erro ao atualizar avaliação:", error);
  }
}

</script>

{#if $rubric}

    <!-- MATRIZ DA RUBRICA -->
    <div class="max-w-[100%] max-h-[68vh] overflow-x-auto overflow-y-auto">
      <table class="table-fixed border-collapse mt-5">
        <thead class="table-header-group bg-secondary-500 dark:bg-dark-secondary text-md">
          <tr>
            <!-- PERFORMANCE LEVELS -->
            <th class="border border-tertiary-500 border-solid">{$t('criterion')}</th>
            {#each $rubric.performance_levels as level, colIndex}
              <th
                class="border border-tertiary-500 border-solid p-4"
              >
                <div class="flex flex-row flex-nowrap justify-between items-center cursor-grab w-full h-4 mb-2">
                </div>
                {level.name}
                <br />
                {level.value} {$t('points')}
              </th>
            {/each}
          </tr>
        </thead>
        <!-- CRITÉRIOS -->
        <tbody class="table-row-group text-center">
          {#each $rubric.criteria as criterion, cIndex}
            <tr class="transition-all">
              <!-- Ícone de drag-and-drop -->
              <td class="border border-tertiary-500 bg-secondary-500 border-solid p-2 dark:bg-dark-secondary">
              {criterion.name}
              </td>
              {#each criterion.descriptors as descriptor, dIndex}
                <td
                  class="border border-tertiary-500 border-solid p-0.5 max-w-32 min-w-32 break-words"
                >
                  <button
                    type="button"
                    class="w-full min-h-20 max-h-20 p-0.5 overflow-auto text-center text-sm bg-secondary-500 dark:bg-dark-secondary font-medium"
                    on:click={() => selectCell(cIndex, dIndex)}
                    aria-label="Select cell"
                    class:selected={$selectedCells[cIndex] === dIndex}
                  >
                    {descriptor ? descriptor : ""}
                  </button>
                </td>
              {/each}
            </tr>
          {/each}
        </tbody>
      </table>
    </div>
    <div class="flex items-center justify-between m-2">
      <p class="mt-4 text-lg font-bold">{$t('total_score')}: {$totalScore}</p>
      <!-- Botão Salvar -->
      <button on:click={() => updateEvaluationResultG(student_ids)} class="mt-5 btn bg-primary-500 text-white hover:bg-primary-600">
        {$t('save')}
      </button>
    </div>
{:else}
  <p>{$t('loading_rubric')}</p>
{/if}

<style>
  th, td {
    max-width: 13.4vw;
    min-width: 13.4vw;
  }
  .selected {
    background-color: #218d03;
  }
</style>
