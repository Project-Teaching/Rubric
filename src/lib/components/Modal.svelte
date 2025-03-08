<script lang="ts">
    export let modalFunction: any, modalTitle: any, modalMessage: any, modalButton: any, modalId: any;
    import { t } from 'svelte-i18n';
</script>

  <!-- Modal de confirmação -->
  <dialog id="{modalId}" class="modal">
    <div class="modal-box bg-secondary-500 dark:bg-dark-surface p-2">
      <h3 class="text-lg font-bold">{modalTitle}</h3>
      <p class="py-4">{modalMessage}</p>
      <div class="modal-action">
        <button on:click={modalFunction} class="btn variant-filled-error dark:bg-error-500">{modalButton}</button>
        <form method="dialog">
          <!-- if there is a button in form, it will close the modal -->
          <button class="btn bg-secondary-200 dark:bg-dark-secondary">{$t('modal_cancel_btn')}</button>
        </form>
      </div>
    </div>
  </dialog>