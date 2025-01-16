<script lang="ts">
  import { doc, getDoc, updateDoc, arrayUnion } from "firebase/firestore";
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
  export let studentId: string | undefined;
  export let professorId: string;
  export let evaluationId: string;

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

  async function updateEvaluationResult() {
  if (!$rubric) {
    console.error("Rubrica não encontrada.");
    return;
  }

  // Estrutura de resultado da avaliação para o aluno
  const evaluation_results = [{
    evaluation_comment: "", // Comentário do professor
    evaluation_notes: "", // Notas adicionais
    groupd_id: "", // ID do grupo, se necessário
    student_id: studentId, // ID do aluno
    score: $totalScore, // Soma das pontuações
    professor_id: professorId, // ID do professor
    rubric_evaluation: $rubric.criteria.map((criterion, cIndex) => {
      // Para cada critério, verificamos qual nível de desempenho foi selecionado
      const levelIndex = $selectedCells[cIndex];
      if (levelIndex !== undefined) {
        const level = $rubric.performance_levels[levelIndex];
        return {
          criterion_number: cIndex + 1, 
          level_number: levelIndex + 1,
        };
      }
      return null; // Se nenhum nível foi selecionado, retornamos null
    }).filter(Boolean) // Remover qualquer valor null (caso algum critério não tenha nível selecionado)
  }];

  // Verificar se algum dos resultados está com valor undefined
  if (evaluation_results.some(result => result === undefined || result === null)) {
    console.error("Erro: Há valores undefined ou null nos resultados de avaliação.");
    return;
  }

  try {
    // Referência para o documento de avaliação no Firestore
    const evaluationRef = doc(db, "evaluations", evaluationId);

    // Atualiza o campo "evaluation_result" no documento da avaliação
    await updateDoc(evaluationRef, {
      evaluation_result: arrayUnion(...evaluation_results) // Adiciona os resultados de avaliação para o aluno
    });

    console.log("Avaliação do aluno atualizada com sucesso.");
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
      <button on:click={() => updateEvaluationResult()} class="mt-5 btn bg-primary-500 text-white hover:bg-primary-600">
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
