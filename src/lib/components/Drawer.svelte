<script>
  import { t } from 'svelte-i18n';
</script>

<div class="drawer-side">
    <label for="my-drawer" aria-label="close sidebar" class="drawer-overlay"></label>
    <ul class="menu bg-secondary-500 dark:bg-dark-surface text-base-content min-h-full w-80 p-4 font-bold drawer-text">
      <li><a href="/rubricas/">{$t('drawer_btn_1')}</a></li>
      <li><a href="/cursos/">{$t('drawer_btn_2')}</a></li>
      <li><a href="/discentes/">{$t('drawer_btn_3')}</a></li>
      <li><a href="/">{$t('drawer_btn_4')}</a></li>
      <li><a href="/suporte/chatbot/">{$t('drawer_btn_5')}</a></li>
    </ul>
  </div>