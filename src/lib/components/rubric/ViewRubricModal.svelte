<script lang="ts">
  import { doc, getDoc } from "firebase/firestore";
  import { db } from "$lib/firebase";
  import { onMount } from "svelte";
  import { writable } from "svelte/store";
  import { t } from "svelte-i18n";
  import ConfirmEditModal from "$lib/components/ConfirmEditModal.svelte";

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
  export let onEdit: () => void;

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

  function closeModal() {
    const modal = document.getElementById("view_rubric_modal");
    if (modal) {
      // @ts-ignore
      modal.close();
    }
  }

  function openConfirmEditModal() {
    const modal = document.getElementById("confirm_edit_modal");
    if (modal) {
      // @ts-ignore
      modal.showModal();
    }
  }
</script>

<dialog id="view_rubric_modal" class="modal">
  <div
    class="max-w-[80vw] max-h-[68vh] bg-secondary-500 dark:bg-dark-surface p-2 overflow-x-auto overflow-y-auto"
  >
    <h3 class="text-lg font-bold mb-4">{$t("view_rubric")}</h3>
    {#if $rubric}
      <div class="max-w-full max-h-[68vh] overflow-x-auto overflow-y-auto">
        <table class="table-fixed border-collapse mt-5 w-full">
          <thead
            class="table-header-group bg-secondary-500 dark:bg-dark-secondary text-md"
          >
            <tr>
              <th class="border border-tertiary-500 border-solid"
                >{$t("criterion")}</th
              >
              {#each $rubric.performance_levels as level}
                <th class="border border-tertiary-500 border-solid p-4">
                  {level.name}
                  <br />
                  {level.value}
                  {$t("points")}
                </th>
              {/each}
            </tr>
          </thead>
          <tbody class="table-row-group text-center">
            {#each $rubric.criteria as criterion}
              <tr class="transition-all">
                <td
                  class="border border-tertiary-500 bg-secondary-500 border-solid p-2 dark:bg-dark-secondary"
                >
                  {criterion.name}
                </td>
                {#each criterion.descriptors as descriptor}
                  <td
                    class="border border-tertiary-500 border-solid p-0.5 max-w-32 min-w-32 break-words"
                  >
                    {descriptor ? descriptor : ""}
                  </td>
                {/each}
              </tr>
            {/each}
          </tbody>
        </table>
      </div>
      <div class="modal-action">
        <button
          on:click={openConfirmEditModal}
          class="btn bg-primary-500 text-white hover:bg-primary-600"
          >{$t("edit")}</button
        >
        <button
          on:click={closeModal}
          class="btn bg-secondary-500 dark:bg-dark-secondary"
          >{$t("close")}</button
        >
      </div>
    {:else}
      <p>{$t("loading_rubric")}</p>
    {/if}
  </div>
</dialog>

<ConfirmEditModal onConfirm={onEdit} onCancel={closeModal} />

<style>
  th,
  td {
    max-width: 13.4vw;
    min-width: 13.4vw;
  }
</style>
