<script lang="ts">
  import {
    doc,
    getDoc,
    updateDoc,
    addDoc,
    collection,
  } from "firebase/firestore";
  import { db } from "$lib/firebase";
  import { onMount } from "svelte";
  import { writable } from "svelte/store";
  import { createEventDispatcher } from "svelte";
  import TagAutoComplete from "../TagAutoComplete.svelte";
  // @ts-ignore
  import IoMdTrash from "svelte-icons/io/IoMdTrash.svelte";
  // @ts-ignore
  import IoMdRefreshCircle from "svelte-icons/io/IoMdRefreshCircle.svelte";
  import Modal from "../Modal.svelte";
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
    course: string[]; // Alterado para array de strings
    major: string[]; // Alterado para array de strings
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
  let descriptorIndex: number | null = null;
  let criterionIndex: number | null = null;
  let isOver: number | null = null;
  let linhaRemover: number | null = null; // Variável global para armazenar a linha a ser removida
  let colunaRemover: number | null = null; // Variável global para armazenar a linha a ser removida

  // Função para abrir o modal de edição de descritor
  function openEditModal(cIndex: number, dIndex: number) {
    descriptorIndex = dIndex;
    criterionIndex = cIndex;
    const textarea = document.getElementById(
      "descriptor_textarea"
    ) as HTMLTextAreaElement;
    if ($rubric) {
      textarea.value = $rubric.criteria[cIndex].descriptors[dIndex];
    }
    // @ts-ignore
    document.getElementById("edit_modal")?.showModal();
  }

  // Função para abrir o modal de reset do grid
  function openResetModal() {
    // @ts-ignore
    document.getElementById("reset_modal")?.showModal();
  }

  // Função para abrir o modal de publicação
  function openPublishModal() {
    // @ts-ignore
    document.getElementById("publish_modal")?.showModal();
  }

    // Função para abrir o modal de aviso de edição
    function openEditWarningModal() {
    // @ts-ignore
    document.getElementById("edit_warning_modal")?.showModal();
  }

  // CONTROLADORES LINHAS
  // Função para abrir o modal de exclusão
  function openDeleteRowModal(row: number) {
    linhaRemover = row; // Armazena a linha a ser removida
    const modal = document.getElementById("row_confirm_modal");
    if (modal) {
      // Exibe o modal de confirmação
      // @ts-ignore
      modal.showModal();
    }
  }

  // Função para confirmar e remover a linha
  function confirmRemoveRow() {
    if (linhaRemover !== null) {
      // Remove a linha do índice armazenado
      removeCriterion(linhaRemover);

      // Fecha o modal de confirmação
      // @ts-ignore
      document.getElementById("row_confirm_modal")?.close();

      // Limpa a variável após a remoção
      linhaRemover = null;
    }
  }

  // Função para cancelar a exclusão e fechar o modal
  function cancelRemoveRow() {
    // Fecha o modal de confirmação
    // @ts-ignore
    document.getElementById("row_confirm_modal")?.close();

    // Limpa a variável, já que a remoção foi cancelada
    linhaRemover = null;
  }
  // CONTROLADORES LINHAS

  // CONTROLADORES COLUNAS
  // Função para abrir o modal de exclusão
  function openDeleteColumnModal(col: number) {
    colunaRemover = col; // Armazena a linha a ser removida
    const modal = document.getElementById("col_confirm_modal");
    if (modal) {
      // Exibe o modal de confirmação
      // @ts-ignore
      modal.showModal();
    }
  }

  // Função para confirmar e remover a linha
  function confirmRemoveColumn() {
    if (colunaRemover !== null) {
      // Remove a linha do índice armazenado
      removePerformanceLevel(colunaRemover);

      // Fecha o modal de confirmação
      // @ts-ignore
      document.getElementById("col_confirm_modal")?.close();

      // Limpa a variável após a remoção
      colunaRemover = null;
    }
  }

  // Função para cancelar a exclusão e fechar o modal
  function cancelRemoveColumn() {
    // Fecha o modal de confirmação
    // @ts-ignore
    document.getElementById("col_confirm_modal")?.close();

    // Limpa a variável, já que a remoção foi cancelada
    colunaRemover = null;
  }
  // CONTROLADORES COLUNAS

  // Função para salvar o descritor
  async function saveDescriptor() {
    if (descriptorIndex !== null && criterionIndex !== null) {
      const textarea = document.getElementById(
        "descriptor_textarea"
      ) as HTMLTextAreaElement;
      const newDescriptor = textarea.value;

      // Atualiza o estado e o Firestore
      rubric.update((r) => {
        if (r) {
          // @ts-ignore
          r.criteria[criterionIndex].descriptors[descriptorIndex] =
            newDescriptor;
          saveRubricField(docId, "criteria", r.criteria);
        }
        return r;
      });
      // @ts-ignore
      document.getElementById("edit_modal")?.close();
    }
  }

  // Função para buscar a rubrica no Firestore
  async function fetchRubric(id: string) {
    const docRef = doc(db, "rubrics", id);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      rubric.set(docSnap.data() as Rubric);
    } else {
      console.log("No such document!");
    }
  }

  // Função para salvar um campo específico da rubrica no Firestore
  async function saveRubricField(id: string, field: string, value: any) {
    const docRef = doc(db, "rubrics", id);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      const data = docSnap.data();
      const updatedData = { ...data, [field]: value };
      await updateDoc(docRef, updatedData);
    } else {
      console.error("Documento não encontrado!");
    }
  }

  // Função genérica para lidar com mudanças de campo
  function handleFieldChange(field: string, value: any) {
    rubric.update((r) => {
      if (r) {
        if (field === "model_name") {
          r.model_name = value;
          saveRubricField(docId, field, value);
        } else if (field.includes("criteria")) {
          const [_, index, subfield, subindex] = field.split(".");
          if (subfield === "name") {
            // Atualizando o nome do critério
            r.criteria[index].name = value;
            saveRubricField(docId, "criteria", r.criteria);
          } else {
            // Atualizando os descriptors
            // @ts-ignore
            r.criteria[index][subfield][subindex] = value;
            saveRubricField(docId, "criteria", r.criteria);
          }
        } else if (field.includes("performance_levels")) {
          const [_, index, subfield] = field.split(".");
          // Verifique se o campo é o 'value' e converta para número, se necessário
          if (subfield === "value") {
            value = Number(value); // Garantir que o valor seja um número
          }
          r.performance_levels[index][subfield] = value;
          saveRubricField(docId, "performance_levels", r.performance_levels);
        }
      }
      return r;
    });
  }
  // CONTROLADORES DO GRID - START
  // Função para salvar o grid da rubrica no Firestore
  async function saveRubricGrid(id: string, data: any) {
    const docRef = doc(db, "rubrics", id);
    try {
      await updateDoc(docRef, data);
      console.log("Documento atualizado com sucesso!");
    } catch (error) {
      console.error("Erro ao atualizar o documento:", error);
    }
  }
  // ADICIONA LINHA
  function addCriterion() {
    rubric.update((r) => {
      if (r) {
        // Cria nova linha de criterios
        const newCriterion = {
          name: `Critério ${r.criteria.length + 1}`,
          descriptors: Array(r.performance_levels.length).fill(""),
        };
        // Adiciona a lista completa de criterios
        const updatedCriteria = [...r.criteria, newCriterion];

        r.criteria = updatedCriteria;
        saveRubricField(docId, "criteria", updatedCriteria);
      }
      return r;
    });
  }
  // ADICIONA COLUNA
  function addPerformanceLevel() {
    rubric.update((r) => {
      if (r) {
        const newLevel = {
          name: `Level ${r.performance_levels.length + 1}`,
          value: r.performance_levels.length + 1,
        };
        const updatedLevels = [...r.performance_levels, newLevel];

        const updatedCriteria = r.criteria.map((criterion) => ({
          ...criterion,
          descriptors: [...criterion.descriptors, ""],
        }));

        r.performance_levels = updatedLevels;
        r.criteria = updatedCriteria;

        saveRubricGrid(docId, {
          performance_levels: updatedLevels,
          criteria: updatedCriteria,
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
        saveRubricField(docId, "criteria", newCriteria);
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
          descriptors: criterion.descriptors.filter((_, i) => i !== index),
        }));

        saveRubricGrid(docId, {
          performance_levels: newLevels,
          criteria: updatedCriteria,
        });

        return {
          ...r,
          performance_levels: newLevels,
          criteria: updatedCriteria,
        };
      }
      return r;
    });
  }
  // RESETA O GRID PARA 3X5
  function resetGrid() {
    rubric.update((r) => {
      if (r) {
        // Define o estado inicial
        const initialPerformanceLevels = Array.from({ length: 5 }, (_, i) => ({
          name: `Level ${i + 1}`,
          value: i + 1,
        }));

        const initialCriteria = Array.from({ length: 3 }, (_, i) => ({
          name: `Critério ${i + 1}`,
          descriptors: Array(initialPerformanceLevels.length).fill(""),
        }));

        // Atualiza o estado da rubrica
        r.performance_levels = initialPerformanceLevels;
        r.criteria = initialCriteria;

        // Salva as alterações no Firebase
        saveRubricGrid(docId, {
          performance_levels: initialPerformanceLevels,
          criteria: initialCriteria,
        });
      }
      return r;
    });
    // @ts-ignore
    document.getElementById("reset_modal")?.close();
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
  // CONTROLE DE DRAG AND DROP DE LINHAS - START
  function onDragStartRow(e: DragEvent) {
    const dragged = getDraggedParent(e.target);
    e.dataTransfer?.setData("sourceRow", dragged?.index.toString());
  }

  function onDragOverRow(e: DragEvent) {
    const over = getDraggedParent(e.target);
    isOver = over.id;
  }

  function onDropRow(e: DragEvent) {
    const sourceIndex = e.dataTransfer?.getData("sourceRow");
    const target = getDraggedParent(e.target);
    reorderRow({ from: parseInt(sourceIndex), to: parseInt(target.index) });
    isOver = false;
  }

  // Função para reordenar as linhas
  async function reorderRow({ from, to }: any) {
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
  // CONTROLE DE DRAG AND DROP DE LINHAS - END

  // CONTROLE DE DRAG AND DROP DE COLUNAS - START
  function onDragStartColumn(e: DragEvent) {
    const dragged = getDraggedParent(e.target);
    e.dataTransfer?.setData("sourceColumn", dragged?.index.toString());
  }

  function onDragOverColumn(e: DragEvent) {
    const over = getDraggedParent(e.target);
    isOver = over.id;
  }

  function onDropColumn(e: DragEvent) {
    const sourceIndex = e.dataTransfer?.getData("sourceColumn");
    const target = getDraggedParent(e.target);
    reorderColumn({ from: parseInt(sourceIndex), to: parseInt(target.index) });
    isOver = false;
  }

  // Função para reordenar as colunas
  async function reorderColumn({ from, to }: any) {
    rubric.update((r) => {
      if (r) {
        // Reordenando os descritores das colunas
        const newCriterions = r.criteria.map((criterion) => {
          const newDescriptors = [...criterion.descriptors];
          // Troca as posições de dois descritores
          const temp = newDescriptors[from];
          newDescriptors[from] = newDescriptors[to];
          newDescriptors[to] = temp;
          return { ...criterion, descriptors: newDescriptors };
        });

        // Reordenando os níveis de performance (colunas)
        const newPerformanceLevels = [...r.performance_levels];
        // Troca as posições de dois níveis de performance
        const tempPerformance = newPerformanceLevels[from];
        newPerformanceLevels[from] = newPerformanceLevels[to];
        newPerformanceLevels[to] = tempPerformance;

        // Atualizando os critérios e os níveis de performance no objeto
        r.criteria = newCriterions;
        r.performance_levels = newPerformanceLevels;

        // Salvando as alterações no banco de dados
        saveRubricGrid(docId, {
          criteria: newCriterions,
          performance_levels: newPerformanceLevels,
        });

        // Despachando evento para atualizar a UI
        dispatch("sort", {
          criteria: newCriterions,
          performance_levels: newPerformanceLevels,
        });
      }
      return r;
    });
  }
  // CONTROLE DE DRAG AND DROP DE COLUNAS - END
  // CONTROLE DE DRAG AND DROP - END

  async function saveAll() {
    const docRef = doc(db, "rubrics", docId);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      // Pega o valor atual do 'rubric' armazenado no writable
      rubric.subscribe(async (currentRubric) => {
        if (currentRubric) {
          // Se o writable não for nulo, salva os dados no Firestore
          const updatedData = {
            ...docSnap.data(), // Obtém os dados existentes no Firestore
            model_name: currentRubric.model_name,
            course: currentRubric.course,
            major: currentRubric.major,
            criteria: currentRubric.criteria,
            performance_levels: currentRubric.performance_levels,
            public: false, // Não está pública enquanto em edição
            version: currentRubric.version,
            original_model: currentRubric.original_model,
            finished: false, // Não está finalizada enquanto em edição
          };

          // Atualiza o documento no Firestore com os novos dados
          await updateDoc(docRef, updatedData);
          console.log("Rubric atualizada com sucesso!");
          // Fecha o modal de aviso de edição
          // @ts-ignore
          document.getElementById("edit_warning_modal")?.close();
        }
      });
    } else {
      console.error("Documento não encontrado!");
    }
  }

  async function publishRubric() {
    const docRef = doc(db, "rubrics", docId);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      const data = docSnap.data();
      const newVersion = data.version + 1;

      // Cria uma nova rubrica com a nova versão
      const newRubric = {
        ...data,
        version: newVersion,
        public: true,
        finished: true,
        original_model: docId,
      };

      await addDoc(collection(db, "rubrics"), newRubric);

      // Atualiza a rubrica atual para não ser mais utilizada
      await updateDoc(docRef, { public: true, finished: false });

      console.log("Rubrica publicada com sucesso!");
          // Fecha o modal de publicação
      // @ts-ignore
      document.getElementById("publish_modal")?.close();
    } else {
      console.error("Documento não encontrado!");
    }
  }

  onMount(() => {
    fetchRubric(docId);
  });
</script>

{#if $rubric}
  <div class="rubric-matrix m-6 bg">
    <!-- CONTROLADORES SUPERIORES DA RUBRICA -->
    <div class="flex justify-between mb-4">
      <div>
        <button
          id="row_add_btn"
          class="btn dark:text-white variant-filled-primary font-bold ml-2"
          on:click={addCriterion}>{$t("row")} +</button
        >
        <!--<button
          class="btn variant-filled-secondary mr-2"
          on:click={() => removeCriterion($rubric.criteria.length - 1)}
          >Linha -</button
        >-->
      </div>
      <div>
        <button
          id="reset_grid_rubric_btn"
          class="btn variant-filled-error hover:bg-error-800 hover-up ml-2 mt-2 rounded-full p-2"
          title="Resetar Grid"
          on:click={openResetModal}
        >
          <div class="w-8 hover-up hover:text-white">
            <IoMdRefreshCircle />
          </div>
        </button>
      </div>
      <div>
        <button
          id="column_add_btn"
          class="btn variant-filled-primary dark:text-white font-bold"
          on:click={addPerformanceLevel}>{$t("column")} +</button
        >
        <!--<button
          class="btn variant-filled-secondary mr-2"
          on:click={() =>
            removePerformanceLevel($rubric.performance_levels.length - 1)}
          >Coluna -</button
        >-->
      </div>
    </div>
    <!-- INFORMAÇÕES DA RUBRICA -->
    <div class="flex justify-start" id="rubric_model_name_label">
      <label
        class="input dark:bg-dark-surface border-none flex items-center gap-2 w-[20%]"
      >
        {$t("model_name")}:
        <input
          id="model_name"
          type="text"
          class="grow bg-secondary-500 dark:bg-dark-secondary p-1 text-lg rounded-md max-h-7"
          value={$rubric.model_name}
          on:keydown={(e) =>
            e.key === "Enter" &&
            handleFieldChange("model_name", e.target?.value)}
        />
      </label>
    </div>
    <!-- MATRIZ DA RUBRICA -->
    <div class="max-w-[100vw] max-h-[68vh] overflow-x-auto overflow-y-auto">
      <table class="table-fixed border-collapse mt-5">
        <thead
          class="table-header-group bg-secondary-500 dark:bg-dark-secondary text-md"
        >
          <tr>
            <th
              class="drag-drop-row-cell border border-tertiary-500 border-solid"
            ></th>
            <!-- PERFORMANCE LEVELS -->
            <th class="border border-tertiary-500 border-solid"
              >{$t("criterion")}</th
            >
            {#each $rubric.performance_levels as level, colIndex}
              <th
                class="border border-tertiary-500 border-solid p-4"
                class:over={colIndex === isOver}
                data-index={colIndex}
                data-id={colIndex}
                draggable="true"
                on:dragstart={onDragStartColumn}
                on:dragover|preventDefault={onDragOverColumn}
                on:drop={onDropColumn}
              >
                <div
                  class="flex flex-row flex-nowrap justify-between items-center cursor-grab w-full h-4 mb-2"
                >
                  <span
                    id="grab_drop_btn_column"
                    class="text-xl font-semibold text-center text-black dark:text-white cursor-grab"
                    >≡</span
                  >
                  <div
                    id="delete_column_btn"
                    class="hover:text-error-500 w-5"
                    role="button"
                    tabindex="0"
                    on:click={() => openDeleteColumnModal(colIndex)}
                    on:keydown={(e) =>
                      e.key === "Enter" && openDeleteColumnModal(colIndex)}
                    aria-label="Remover Linha"
                  >
                    <IoMdTrash />
                  </div>
                </div>
                <input
                  id="performance_level_input"
                  class="grow bg-surface-500 dark:bg-dark-surface p-1 text-lg rounded-md max-h-7 text-center max-w-48"
                  type="text"
                  value={level.name}
                  on:keydown={(e) =>
                    e.key === "Enter" &&
                    handleFieldChange(
                      `performance_levels.${$rubric.performance_levels.indexOf(level)}.name`,
                      e.target?.value
                    )}
                />
                <br />
                <input
                  id="performance_level_value_input"
                  class="grow bg-surface-500 dark:bg-dark-surface text-lg rounded-md max-h-7 text-center max-w-16 mt-1"
                  type="number"
                  min="0"
                  value={level.value}
                  on:keydown={(e) =>
                    e.key === "Enter" &&
                    handleFieldChange(
                      `performance_levels.${$rubric.performance_levels.indexOf(level)}.value`,
                      e.target?.value
                    )}
                />
                {$t("points")}
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
                class:over={cIndex === isOver}
                data-index={cIndex}
                data-id={cIndex}
                draggable="true"
                on:dragstart={onDragStartRow}
                on:dragover|preventDefault={onDragOverRow}
                on:drop={onDropRow}
              >
                <div class="indicator cursor-grab">
                  <div class="indicator-item indicator-bottom indicator-start">
                    <div
                      class="hover:text-error-500 w-5 mt-9 ml-3.5"
                      role="button"
                      tabindex="0"
                      on:click={() => openDeleteRowModal(cIndex)}
                      on:keydown={(e) =>
                        e.key === "Enter" && openDeleteRowModal(cIndex)}
                      aria-label="Remover Linha"
                    >
                      <IoMdTrash />
                    </div>
                  </div>
                  <span
                    class="text-xl font-semibold text-center text-black dark:text-white cursor-grab"
                    >≡</span
                  >
                </div>
              </td>
              <!-- Ícone de drag-and-drop -->
              <td class="border border-tertiary-500 border-solid p-2">
                <input
                  id="criterion_input"
                  class="grow bg-secondary-500 dark:bg-dark-secondary p-1 text-lg rounded-md max-h-7 text-center font-medium"
                  type="text"
                  value={criterion.name}
                  on:keydown={(e) =>
                    e.key === "Enter" &&
                    handleFieldChange(
                      `criteria.${cIndex}.name`,
                      e.target?.value
                    )}
                />
              </td>
              {#each criterion.descriptors as descriptor, dIndex}
                <td
                  class="border border-tertiary-500 border-solid p-0.5 max-w-32 min-w-32 break-words"
                >
                  <div
                    id="descriptor_cell"
                    class="w-full min-h-20 max-h-20 p-0.5 overflow-auto text-center text-sm bg-secondary-500 dark:bg-dark-secondary font-medium"
                    role="button"
                    tabindex="0"
                    on:click={() => openEditModal(cIndex, dIndex)}
                    on:keydown={(e) =>
                      e.key === "Enter" && openEditModal(cIndex, dIndex)}
                    aria-label="Editar descritor"
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
    <!-- TAGS DA RUBRICA -->
    <div class="w-max-[100vw] flex justify-between items-center">
      <div class="flex justify-start" id="rubric_tags_label">
        <div class="w-max m-2">
          {$t("majors")}:
          <TagAutoComplete {docId} field={"major"} />
        </div>
        <div class="w-max m-2">
          {$t("courses")}:
          <TagAutoComplete {docId} field={"course"} />
        </div>
      </div>
      <div class="flex justify-center items-center m-2 ml-5">
        <button
          id="save_model_rubric_btn"
          class="btn variant-filled-primary font-bold dark:text-white ml-2"
          on:click={openEditWarningModal}>{$t("edit_rubric_save_btn")}</button
        >
        <button
          on:click={openPublishModal}
          class="btn bg-primary-500 text-white hover:bg-primary-600"
        >
          {$t("publish_rubric_btn")}
        </button>
      </div>
    </div>
    <!-- Modal para editar descritores -->
    <dialog id="edit_modal" class="modal">
      <div class="modal-box bg-secondary-500 dark:bg-dark-surface p-2">
        <h3 class="text-lg font-bold mb-2">
          {$t("edit_rubric_descriptor_modal_title")}
        </h3>
        <textarea
          id="descriptor_textarea"
          class="textarea textarea-bordered w-full h-32 bg-surface-200 dark:bg-dark-secondary border-none"
          placeholder={$t("edit_rubric_descriptor_modal_placeholder")}
        ></textarea>
        <div class="modal-action">
          <button on:click={saveDescriptor} class="btn bg-primary-500"
            >{$t("edit_rubric_descriptor_modal_save_btn")}</button
          >
          <form method="dialog">
            <!-- if there is a button in form, it will close the modal -->
            <button class="btn bg-secondary-500 dark:bg-dark-secondary"
              >{$t("modal_cancel_btn")}</button
            >
          </form>
        </div>
      </div>
    </dialog>

    <Modal
      modalId={"row_confirm_modal"}
      modalFunction={confirmRemoveRow}
      modalTitle={$t("modal_delete_title")}
      modalMessage={$t("modal_row_delete_message")}
      modalButton={$t("modal_confirm_button")}
    />

    <Modal
      modalId={"col_confirm_modal"}
      modalFunction={confirmRemoveColumn}
      modalTitle={$t("modal_delete_title")}
      modalMessage={$t("modal_column_delete_message")}
      modalButton={$t("modal_confirm_button")}
    />

    <Modal
      modalId={"reset_modal"}
      modalFunction={resetGrid}
      modalTitle={$t("modal_clean_title")}
      modalMessage={$t("modal_clean_message")}
      modalButton={$t("modal_confirm_button")}
    />

    <!-- Modal de confirmação para publicar a rubrica -->
    <Modal
      modalId="publish_modal"
      modalFunction={publishRubric}
      modalTitle={$t("modal_publish_title")}
      modalMessage={$t("modal_publish_message")}
      modalButton={$t("modal_confirm_button")}
    />

    
<!-- Modal de aviso de edição -->
<Modal modalId="edit_warning_modal" modalFunction={saveAll} modalTitle={$t('edit_rubric_warning_title')} modalMessage={$t('edit_rubric_warning_message')} modalButton={$t('modal_confirm_button')} />
  </div>
{:else}
  <p>{$t("loading_rubric")}</p>
{/if}

<style>
  .over {
    @apply border-gray-400 scale-105;
  }

  th {
    max-width: 15.4vw;
    min-width: 15.4vw;
  }

  .hover-up {
    transition:
      transform 0.2s ease-in-out,
      box-shadow 0.2s ease-in-out;
  }

  .hover-up:hover {
    transform: scale(1.01);
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  }

  .drag-drop-row-cell {
    max-width: 2.5rem;
    min-width: 2.5rem;
  }
</style>
