<script lang="ts">
  import { doc, getDoc, updateDoc} from 'firebase/firestore';
  import { db } from '$lib/firebase';
  import { onMount } from 'svelte';
  import { writable } from 'svelte/store';
  import { createEventDispatcher } from "svelte";
  import TagAutoComplete from '../TagAutoComplete.svelte';

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
    course: string[]; // Alterado para array de strings
    major: string[]; // Alterado para array de strings
    uid: string;
    criteria: Criterion[];
    performance_levels: PerformanceLevel[];
  }
  export let docId: string;
  let rubric = writable<Rubric | null>(null);

  let descriptorIndex: number | null = null;
  let criterionIndex: number | null = null;
  let isOver: number | null = null;

  // Função para abrir o modal de edição de descritor
  function openEditModal(cIndex: number, dIndex: number) {
    descriptorIndex = dIndex;
    criterionIndex = cIndex;
    const textarea = document.getElementById('descriptor_textarea') as HTMLTextAreaElement;
    if ($rubric) {
      textarea.value = $rubric.criteria[cIndex].descriptors[dIndex];
    }
    // @ts-ignore
    document.getElementById('edit_modal')?.showModal();
  }

  // Função para salvar o descritor
  async function saveDescriptor() {
    if (descriptorIndex !== null && criterionIndex !== null) {
      const textarea = document.getElementById('descriptor_textarea') as HTMLTextAreaElement;
      const newDescriptor = textarea.value;

      // Atualiza o estado e o Firestore
      rubric.update((r) => {
        if (r) {
          // @ts-ignore
          r.criteria[criterionIndex].descriptors[descriptorIndex] = newDescriptor;
          saveRubricField(docId, 'criteria', r.criteria);
        }
        return r;
      });
      // @ts-ignore
      document.getElementById('edit_modal')?.close();
    }
  }

  // Função para buscar a rubrica no Firestore
  async function fetchRubric(id: string) {
    const docRef = doc(db, 'rubrics', id);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      rubric.set(docSnap.data() as Rubric);
    } else {
      console.log('No such document!');
    }
  }

 // Função para salvar um campo específico da rubrica no Firestore
  async function saveRubricField(id: string, field: string, value: any) {
      const docRef = doc(db, 'rubrics', id);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        const data = docSnap.data();
        const updatedData = { ...data, [field]: value };
        await updateDoc(docRef, updatedData);
      } else {
        console.error('Documento não encontrado!');
      }
  }

  // Função genérica para lidar com mudanças de campo
  function handleFieldChange(field: string, value: any) {
      rubric.update((r) => {
          if (r) {
              if (field === 'model_name') {
                  r.model_name = value;
                  saveRubricField(docId, field, value);
              } else if (field.includes('criteria')) {
                  const [_, index, subfield, subindex] = field.split('.');
                  // @ts-ignore
                  r.criteria[index][subfield][subindex] = value;
                  saveRubricField(docId, 'criteria', r.criteria);
              } else if (field.includes('performance_levels')) {
                  const [_, index, subfield] = field.split('.');
                  // @ts-ignore
                  r.performance_levels[index][subfield] = value;
                  saveRubricField(docId, 'performance_levels', r.performance_levels);
              } else if (field === 'course') {
                  addTag('course', value);
              } else if (field === 'major') {
                  addTag('major', value);
              }
          }
          return r;
      });
  }
  // CONTROLADORES DO GRID - START
  // Função para salvar o grid da rubrica no Firestore
  async function saveRubricGrid(id: string, data: any) {
    const docRef = doc(db, 'rubrics', id);
    try {
      await updateDoc(docRef, data);
      console.log('Documento atualizado com sucesso!');
    } catch (error) {
      console.error('Erro ao atualizar o documento:', error);
    }
  }
  // ADICIONA LINHA
  function addCriterion() {
  rubric.update((r) => {
    if (r) {
      // Cria nova linha de criterios
      const newCriterion = { name: `Critério ${r.criteria.length + 1}`, descriptors: Array(r.performance_levels.length).fill('') };
      // Adiciona a lista completa de criterios
      const updatedCriteria = [...r.criteria, newCriterion];

      r.criteria = updatedCriteria;
      saveRubricField(docId, 'criteria', updatedCriteria);
    }
    return r;
  });
  }
  // ADICIONA COLUNA
  function addPerformanceLevel() {
    rubric.update((r) => {
      if (r) {
        const newLevel = { name: `Level ${r.performance_levels.length + 1}`, value: r.performance_levels.length + 1 };
        const updatedLevels = [...r.performance_levels, newLevel];
        
        const updatedCriteria = r.criteria.map(criterion => ({
          ...criterion,
          descriptors: [...criterion.descriptors, '']
        }));

        r.performance_levels = updatedLevels;
        r.criteria = updatedCriteria;

        saveRubricGrid(docId, {
          performance_levels: updatedLevels,
          criteria: updatedCriteria
        });
      }
      return r;
    });
  }
  // REMOVE LINHA
  function removeCriterion(index: number) {
      rubric.update((r) => {
          if (r && r.criteria.length > index) {
              const newCriteria = r.criteria.filter((_, i) => i !== index);
              saveRubricField(docId, 'criteria', newCriteria);
              return { ...r, criteria: newCriteria };
          }
          return r;
      });
  }
  // REMOVE COLUNA
  function removePerformanceLevel(index: number) {
      rubric.update((r) => {
          if (r && r.performance_levels.length > index) {
              const newLevels = r.performance_levels.filter((_, i) => i !== index);
              const updatedCriteria = r.criteria.map((criterion) => ({
                  ...criterion,
                  descriptors: criterion.descriptors.filter((_, i) => i !== index)
              }));

              saveRubricGrid(docId, {
                  performance_levels: newLevels,
                  criteria: updatedCriteria
              });

              return { ...r, performance_levels: newLevels, criteria: updatedCriteria };
          }
          return r;
      });
  }
  // RESETA O GRID PARA 3X4
  function resetGrid() {
    rubric.update((r) => {
      if (r) {
        // Define o estado inicial
        const initialPerformanceLevels = Array.from({ length: 5 }, (_, i) => ({
          name: `Level ${i + 1}`,
          value: i + 1
        }));
        
        const initialCriteria = Array.from({ length: 3 }, (_, i) => ({
          name: `Critério ${i + 1}`,
          descriptors: Array(initialPerformanceLevels.length).fill('')
        }));
        
        // Atualiza o estado da rubrica
        r.performance_levels = initialPerformanceLevels;
        r.criteria = initialCriteria;
        
        // Salva as alterações no Firebase
        saveRubricGrid(docId, {
          performance_levels: initialPerformanceLevels,
          criteria: initialCriteria
        });
      }
      return r;
    });
  }
  // CONTROLADORES DO GRID - END

  // CONTROLE DE DRAG AND DROP - START
  const dispatch = createEventDispatcher();

  // Função para obter o elemento pai do elemento arrastado
  function getDraggedParent(node: any): any {
    if (!node.dataset.index) {
      return getDraggedParent(node.parentNode);
    } else {
      return { ...node.dataset };
    }
  }
  // Função para lidar com o evento de arrastar START
  function onDragStart(e: DragEvent) {
    const dragged = getDraggedParent(e.target);
    e.dataTransfer?.setData("source", dragged?.index.toString());
  }
  // Função para lidar com o evento de arrastar END
  function onDragOver(e: DragEvent) {
    const over = getDraggedParent(e.target);
    isOver = over.id;
  }
  // Função para lidar com o evento de arrastar e soltar
  function onDrop(e: DragEvent) {
    const sourceIndex = e.dataTransfer?.getData("source");
    const target = getDraggedParent(e.target);
    reorder({ from: parseInt(sourceIndex), to: parseInt(target.index) });
    isOver = false;
  }
  // Função para reordenar os elementos
  async function reorder({ from, to }: any) {
    rubric.update((r) => {
      if (r) {
        const newCriterions = [...r.criteria];
        const [movedCriterion] = newCriterions.splice(from, 1);
        newCriterions.splice(to, 0, movedCriterion);

        r.criteria = newCriterions;
        saveRubricGrid(docId, { criteria: newCriterions });

        dispatch("sort", newCriterions);
      }
      return r;
    });
  }
  // CONTROLE DE DRAG AND DROP - END

  onMount(() => {
    fetchRubric(docId);
  });

</script>

{#if $rubric}
  <div class="rubric-matrix m-6 bg">
    <div class="flex justify-between mb-4">
      <div>
        <button class="btn variant-filled-primary ml-2" on:click={addCriterion}>Linha +</button>
        <button class="btn variant-filled-secondary" on:click={() => removeCriterion($rubric.criteria.length - 1)}>Linha -</button>
      </div>
      <div>
        <button class="btn variant-filled-error hover-up ml-2 mt-2" on:click={resetGrid}>Limpar Grid</button>
      </div>
      <div>
        <button class="btn variant-filled-primary" on:click={addPerformanceLevel}>Coluna +</button>
        <button class="btn variant-filled-secondary mr-2" on:click={() => removePerformanceLevel($rubric.performance_levels.length - 1)}>Coluna -</button>
      </div>
    </div>
    <div class="flex justify-start w-20">
      <label class="input dark:bg-dark-surface border-none flex items-center gap-2 max-w">
        Nome da Avaliação:
        <input id="model_name"  type="text" class="grow bg-secondary-500 dark:bg-dark-secondary p-1 text-lg rounded-md max-h-7" value={$rubric.model_name}  on:keydown={(e) => e.key === 'Enter' && handleFieldChange('model_name', e.target?.value)} />
      </label>
    </div>
    <div class="max-w-[100vw] max-h-96 overflow-x-auto overflow-y-auto">
      <table class="table-fixed border-collapse mt-5">
        <thead class="table-header-group bg-secondary-500 dark:bg-dark-secondary text-md">
          <tr>
            <th class="border border-tertiary-500 border-solid">Critério</th>
            {#each $rubric.performance_levels as level}
              <th class="border border-tertiary-500 border-solid p-4">
                <input
                class="grow bg-surface-500 dark:bg-dark-surface p-1 text-lg rounded-md max-h-7 text-center max-w-48" 
                type="text" 
                value={level.name} 
                on:keydown={(e) => e.key === 'Enter' && handleFieldChange(`performance_levels.${$rubric.performance_levels.indexOf(level)}.name`, e.target?.value)}
                /> 
                <br /> 
                <input
                class="grow bg-surface-500 dark:bg-dark-surface text-lg rounded-md max-h-7 text-center max-w-16 mt-1" 
                type="number"
                min="0"
                value={level.value}
                on:keydown={(e) => e.key === 'Enter' && handleFieldChange(`performance_levels.${$rubric.performance_levels.indexOf(level)}.value`, e.target?.value)}
              /> pontos          
              </th>
            {/each}
          </tr>
        </thead>
        <tbody class="table-row-group text-center">
          {#each $rubric.criteria as criterion, cIndex}
            <tr
            class="transition-all"
            class:over={cIndex === isOver}
            data-index={cIndex}
            data-id={cIndex}
            draggable="true"
            on:dragstart={onDragStart}
            on:dragover|preventDefault={onDragOver}
            on:drop={onDrop}
            >
              <td class="border border-tertiary-500 border-solid p-2">
                <input 
                  class="grow bg-secondary-500 dark:bg-dark-secondary p-1 text-lg rounded-md max-h-7 text-center font-medium"
                  type="text" 
                  value={criterion.name} 
                  on:keydown={(e) => e.key === 'Enter' && handleFieldChange(`criteria.${cIndex}.name`, e.target?.value)} 
                />
              </td>
              {#each criterion.descriptors as descriptor, dIndex}
                <td class="border border-tertiary-500 border-solid p-0.5 max-w-32 min-w-32 break-words">
                  <div
                  class="w-full min-h-20 max-h-20 p-0.5 overflow-auto text-center text-sm bg-secondary-500 dark:bg-dark-secondary font-medium"
                  role="button"
                  tabindex="0"
                  on:click={() => openEditModal(cIndex, dIndex)}
                  on:keydown={(e) => e.key === 'Enter' && openEditModal(cIndex, dIndex)}
                  aria-label="Editar descritor"
                >
                  {descriptor ? descriptor : ''}
                </div>
                </td>
              {/each}
            </tr>
          {/each}
        </tbody>
      </table>
    </div>
    <div class="flex justify-start">
      <div class="w-max m-2">
        Cursos:
        <TagAutoComplete docId={docId} field={"major"} />
      </div>
      <div class="w-max m-2">
        Disciplinas:
        <TagAutoComplete docId={docId} field={"course"}/>
      </div>
    </div>

    <!-- Modal para editar descritores -->
    <dialog id="edit_modal" class="modal">
      <div class="modal-box bg-secondary-500 dark:bg-dark-surface p-2">
        <h3 class="text-lg font-bold mb-2">Editar Descritor</h3>
        <textarea id="descriptor_textarea" class="textarea textarea-bordered w-full h-32 bg-surface-200 dark:bg-dark-secondary border-none" placeholder="Digite o descritor aqui..."></textarea>
        <div class="modal-action">
          <button on:click={saveDescriptor} class="btn bg-primary-500">Salvar</button>
          <form method="dialog">
            <!-- if there is a button in form, it will close the modal -->
            <button class="btn bg-secondary-500 dark:bg-dark-secondary">Cancelar</button>
          </form>
        </div>
      </div>
    </dialog>

  </div>
{:else}
  <p>Carregando rubrica...</p>
{/if}


<style>
  .over {
    @apply border-gray-400 scale-105;
  }
  
  th {
    max-width: 15.5vw;
    min-width: 15.5vw;;
  }

  .hover-up {
      transition: transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out;
  }

  .hover-up:hover {
      transform: scale(1.01);
      box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  }
</style>