<script lang="ts">
    import "$lib/i18n"; // Importa o arquivo de configuração de tradução
    import { isLoading } from 'svelte-i18n'
    import { user, userData } from "$lib/firebase";
    import "../app.css";
    import { initializeStores, Toast } from '@skeletonlabs/skeleton';

    initializeStores();
 
    $user;
    $userData; 
 </script>
 
 {#if $isLoading}
 Please wait...
 {:else}
    <div class="min-h-screen flex flex-col">
        <slot />
    </div>
 {/if}