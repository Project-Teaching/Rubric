<script lang="ts">
    import {t} from 'svelte-i18n';

    export let onConfirm: () => void;
    export let onCancel: () => void;
  
    function confirmEdit() {
      onConfirm();
      closeModal();
    }

    function cancelEdit() {
    onCancel();
    closeModal();
  }
  
    function closeModal() {
      const modal = document.getElementById("confirm_edit_modal");
      if (modal) {
        // @ts-ignore
        modal.close();
      }
    }
  </script>
  
  <dialog id="confirm_edit_modal" class="modal">
    <div class="modal-box bg-secondary-500 dark:bg-dark-surface p-4 max-w-lg w-full">
      <h3 class="text-lg font-bold mb-4">{$t("modal_edit_title")}</h3>
      <p>{$t("modal_edit_message")}</p>
      <div class="modal-action">
        <button on:click={confirmEdit} class="btn bg-primary-500 text-white hover:bg-primary-600">{$t("modal_confirm_button")}</button>
        <button on:click={cancelEdit} class="btn bg-secondary-500 dark:bg-dark-secondary">{$t("modal_cancel_btn")}</button>
      </div>
    </div>
  </dialog>