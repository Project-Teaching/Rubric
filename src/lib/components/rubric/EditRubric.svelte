<script lang="ts">
  import { doc, getDoc, updateDoc } from 'firebase/firestore';
  import { db } from '$lib/firebase';
  import { onMount } from 'svelte';
  import { writable } from 'svelte/store';

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
    course: string; // Alterado para array de strings
    major: string; // Alterado para array de strings
    uid: string;
    criteria: Criterion[];
    performance_levels: PerformanceLevel[];
  }

  export let docId: string;

  let rubric = writable<Rubric | null>(null);

  let newCourse = ""; // Para armazenar o valor do input do curso
  let newMajor = ""; // Para armazenar o valor do input do major

  async function fetchRubric(id: string) {
    const docRef = doc(db, 'rubrics', id);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      rubric.set(docSnap.data() as Rubric);
    } else {
      console.log('No such document!');
    }
  }

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

  function handleFieldChange(field: string, value: any) {
      rubric.update((r) => {
          if (r) {
              // Atualize o campo específico da rubrica
              if(field === 'model_name') {
                r.model_name = value;
                saveRubricField(docId, field, value);
              }
              else if(field.includes('criteria')) {
                const [_, index, subfield, subindex] = field.split('.');
                // @ts-ignore
                r.criteria[index][subfield][subindex] = value;
                saveRubricField(docId, 'criteria', r.criteria);
              }
              else if(field.includes('performance_levels')) {
                const [_, index, subfield] = field.split('.');
                // @ts-ignore
                r.performance_levels[index][subfield] = value;
                saveRubricField(docId, 'performance_levels', r.performance_levels);
              }
              else if(field === 'course'){
                r.course = value;
                saveRubricField(docId, field, value);
              }
              else if(field === 'major'){
                r.major = value;
                saveRubricField(docId, field, value);
              }
          }
          return r;
      });
  }

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

  function addPerformanceLevel() {
    rubric.update((r) => {
      if (r) {
        const newLevel = { name: `Level ${r.performance_levels.length + 1}`, value: r.performance_levels.length + 1 };
        const updatedLevels = [...r.performance_levels, newLevel];
        
        // Atualize todos os critérios para adicionar um novo descritor
        const updatedCriteria = r.criteria.map(criterion => ({
          ...criterion,
          descriptors: [...criterion.descriptors, '']
        }));

        // Atualize o estado do componente
        r.performance_levels = updatedLevels;
        r.criteria = updatedCriteria;
        saveRubricField(docId, 'performance_levels', updatedLevels);
        saveRubricField(docId, 'criteria', updatedCriteria);
      }
      return r;
    });
  }

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

  function removePerformanceLevel(index: number) {
      rubric.update((r) => {
          if (r && r.performance_levels.length > index) {
              const newLevels = r.performance_levels.filter((_, i) => i !== index);
              const updatedCriteria = r.criteria.map((criterion) => ({
                  ...criterion,
                  descriptors: criterion.descriptors.filter((_, i) => i !== index)
              }));

              saveRubricField(docId, 'performance_levels', newLevels);
              saveRubricField(docId, 'criteria', updatedCriteria);

              return { ...r, performance_levels: newLevels, criteria: updatedCriteria };
          }
          return r;
      });
  }

  onMount(() => {
    fetchRubric(docId);
  });
</script>

<style>

</style>

{#if $rubric}
  <div class="rubric-matrix m-6 bg">
    <div class="flex justify-between mb-4">
      <div>
        <button class="btn btn-primary ml-2" on:click={addCriterion}>Linha +</button>
        <button class="btn btn-secondary" on:click={() => removeCriterion($rubric.criteria.length - 1)}>Linha -</button>
      </div>
      <div>
        <button class="btn btn-primary" on:click={addPerformanceLevel}>Coluna +</button>
        <button class="btn btn-secondary mr-2" on:click={() => removePerformanceLevel($rubric.performance_levels.length - 1)}>Coluna -</button>
      </div>
    </div>
    <div class="flex justify-center">
      <label class="input flex items-center gap-2 max-w">
        Nome da Avaliação:
        <input id="model_name"  type="text" class="grow bg-secondary p-1 text-lg rounded-md max-h-7" value={$rubric.model_name}  on:keydown={(e) => e.key === 'Enter' && handleFieldChange('model_name', e.target.value)} />
      </label>
      <label class="input flex items-center gap-2 max-w">
        Curso:
        <select id="major" class="grow bg-secondary pb-1 text-lg rounded-md max-h-7" value={$rubric.major} on:change={(e) => handleFieldChange('major', e.target.value)}>
          <option value="Engenharia de Software">Engenharia de Software</option>
          <option value="Ciência da Computação">Ciência da Computação</option>
          <option value="Sistemas de Informação">Sistemas de Informação</option>
        </select>
      </label>
      <label class="input flex items-center gap-2 max-w">
        Disciplina:
        <select id="course" class="grow bg-secondary pb-1 text-lg rounded-md max-h-7" value={$rubric.course} on:change={(e) => handleFieldChange('course', e.target.value)}>
          <option value="Resolução de Problemas IV">Resolução de Problemas IV</option>
          <option value="Engenharia de Software II">Engenharia de Software II</option>
          <option value="Sistemas Operacionais">Sistemas Operacionais</option>
          <option value="Banco de Dados">Banco de Dados</option>
        </select>
      </label>
    </div>
    <div class="max-w-full max-h-96 overflow-x-auto overflow-y-auto">
      <table class="table-auto w-full border-collapse mt-5">
        <thead class="bg-secondary text-md">
          <tr>
            <th class="border border-accent border-solid">Critério</th>
            {#each $rubric.performance_levels as level}
              <th class="border border-accent border-solid p-4">
                <input
                class="grow bg-base-100 p-1 text-lg rounded-md max-h-7 text-center max-w-32" 
                type="text" 
                value={level.name} 
                on:keydown={(e) => e.key === 'Enter' && handleFieldChange(`performance_levels.${$rubric.performance_levels.indexOf(level)}.name`, e.target.value)}
                />  
                <input
                class="grow bg-base-100 text-lg rounded-md max-h-7 text-center max-w-16 mt-1" 
                type="number"
                min="0"
                value={level.value}
                on:keydown={(e) => e.key === 'Enter' && handleFieldChange(`performance_levels.${$rubric.performance_levels.indexOf(level)}.value`, e.target.value)}
              /> pontos          
              </th>
            {/each}
          </tr>
        </thead>
        <tbody class="text-center">
          {#each $rubric.criteria as criterion, cIndex}
            <tr>
              <td class="border border-accent border-solid p-2">
                <input 
                  class="grow bg-secondary p-1 text-lg rounded-md max-h-7 text-center font-medium"
                  type="text" 
                  value={criterion.name} 
                  on:keydown={(e) => e.key === 'Enter' && handleFieldChange(`criteria.${cIndex}.name`, e.target.value)} 
                />
              </td>
              {#each criterion.descriptors as descriptor, dIndex}
                <td class="border border-accent border-solid p-2">
                  <textarea
                    class="textarea textarea-bordered w-full bg-secondary font-medium"
                    value={descriptor} 
                    on:keydown={(e) => e.key === 'Enter' && handleFieldChange(`criteria.${cIndex}.descriptors.${dIndex}`, e.target.value)} 
                  />
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
