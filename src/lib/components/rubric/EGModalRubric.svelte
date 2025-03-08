<script lang="ts">
  import { doc, getDoc, updateDoc, arrayUnion, writeBatch } from "firebase/firestore";
  import { db } from "$lib/firebase";
  import { onMount, beforeUpdate } from "svelte";
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
  let existingEvaluation = writable<any>(null); // Avaliação existente
  let previousGroupId: string | undefined;


  // Função para carregar os dados da rubrica e avaliação
  async function loadData() {
    await fetchRubric(docId);
    await fetchExistingEvaluation();
  }

  async function fetchRubric(id: string) {
    console.log("Buscando rubrica com ID:", id); // Log para depuração
    const docRef = doc(db, "rubrics", id);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      console.log("Rubrica encontrada:", docSnap.data()); // Log para depuração
      rubric.set(docSnap.data() as Rubric);
    } else {
      console.log("Rubrica não encontrada!"); // Log para depuração
    }
  }

  async function fetchExistingEvaluation() {
    console.log("Buscando avaliação existente com ID:", evaluationId);
    const evaluationRef = doc(db, "evaluations", evaluationId);
    const evaluationSnap = await getDoc(evaluationRef);

    if (evaluationSnap.exists()) {
      const evaluationData = evaluationSnap.data();
      console.log("Avaliação encontrada:", evaluationData);

      // Verifica se evaluation_result existe e é um array
      if (Array.isArray(evaluationData.evaluation_result)) {
        const groupEvaluation = evaluationData.evaluation_result.find(
          (result: any) => result.group_id === groupId // Agora groupId é o docId do grupo
        );

        if (groupEvaluation) {
          console.log("Avaliação do grupo encontrada:", groupEvaluation);
          existingEvaluation.set(groupEvaluation);

          const cells: { [key: number]: number } = {};
          groupEvaluation.rubric_evaluation.forEach((criterion: any) => {
            cells[criterion.criterion_number - 1] = criterion.level_number - 1;
          });
          selectedCells.set(cells);
          totalScore.set(groupEvaluation.score);
        } else {
          console.log("Avaliação do grupo não encontrada!");
        }
      } else {
        console.log("evaluation_result não é um array ou está ausente.");
      }
    } else {
      console.log("Avaliação não encontrada!");
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

  // Carrega os dados quando o componente é montado
  onMount(async () => {
    await loadData();
  });


  function selectCell(row: number, col: number) {
    selectedCells.update((cells) => ({ ...cells, [row]: col }));
  }

  async function updateEvaluationResultG() {
    if (!$rubric || !$existingEvaluation) {
      console.error("Rubrica ou avaliação não encontrada.");
      return;
    }

    try {
      const evaluationRef = doc(db, "evaluations", evaluationId);
      const evaluationSnap = await getDoc(evaluationRef);

      if (!evaluationSnap.exists()) {
        console.error("Avaliação não encontrada no Firestore.");
        return;
      }

      const evaluationData = evaluationSnap.data();
      const evaluationResult = evaluationData.evaluation_result;

      // Verifica se evaluation_result é um array
      if (!Array.isArray(evaluationResult)) {
        console.error("evaluation_result não é um array.");
        return;
      }

      const batch = writeBatch(db);

      // Cria a nova avaliação
      const newEvaluation = {
        evaluation_comment: "",
        evaluation_notes: "",
        group_id: groupId,
        professor_id: professorId,
        rubric_evaluation: $rubric.criteria
          .map((criterion, cIndex) => {
            const levelIndex = $selectedCells[cIndex];
            return levelIndex !== undefined
              ? { criterion_number: cIndex + 1, level_number: levelIndex + 1 }
              : null;
          })
          .filter(Boolean),
        score: $totalScore,
      };

      // Atualiza as entradas existentes para cada student_id
      student_ids?.forEach((studentId) => {
        // Encontra a entrada correspondente ao student_id
        const studentEvaluationIndex = evaluationResult.findIndex(
          (result: any) => result.student_id === studentId
        );

        if (studentEvaluationIndex !== -1) {
          // Atualiza a entrada existente
          evaluationResult[studentEvaluationIndex] = {
            ...evaluationResult[studentEvaluationIndex], // Mantém outros campos
            ...newEvaluation, // Sobrescreve com os novos dados
            student_id: studentId, // Garante que o student_id seja mantido
          };
        } else {
          // Se não encontrar, adiciona uma nova entrada (caso o aluno não tenha sido avaliado antes)
          evaluationResult.push({
            ...newEvaluation,
            student_id: studentId,
          });
        }
      });

      // Atualiza o evaluation_result no Firestore
      batch.update(evaluationRef, {
        evaluation_result: evaluationResult,
      });

      await batch.commit();
      console.log("Avaliação do grupo atualizada com sucesso.");
    } catch (error) {
      console.error("Erro ao atualizar avaliação:", error);
    }
  }

  // Bloco reativo para recarregar os dados quando o groupId mudar
  $: if (groupId && groupId !== previousGroupId) {
      previousGroupId = groupId; // Atualiza o groupId anterior
      loadData(); // Recarrega os dados
  }
</script>

{#if $rubric && $existingEvaluation}
  <!-- MATRIZ DA RUBRICA -->
  <div class="max-w-[100%] max-h-[68vh] overflow-x-auto overflow-y-auto">
    <table class="table-fixed border-collapse mt-5">
      <thead class="table-header-group bg-secondary-500 dark:bg-dark-secondary text-md">
        <tr>
          <th class="border border-tertiary-500 border-solid">{$t('criterion')}</th>
          {#each $rubric.performance_levels as level, colIndex}
            <th class="border border-tertiary-500 border-solid p-4">
              {level.name}
              <br />
              {level.value} {$t('points')}
            </th>
          {/each}
        </tr>
      </thead>
      <tbody class="table-row-group text-center">
        {#each $rubric.criteria as criterion, cIndex}
          <tr class="transition-all">
            <td class="border border-tertiary-500 bg-secondary-500 border-solid p-2 dark:bg-dark-secondary">
              {criterion.name}
            </td>
            {#each criterion.descriptors as descriptor, dIndex}
              <td class="border border-tertiary-500 border-solid p-0.5 max-w-32 min-w-32 break-words">
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
    <button on:click={updateEvaluationResultG} class="mt-5 btn bg-primary-500 text-white hover:bg-primary-600">
      {$t('update')}
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