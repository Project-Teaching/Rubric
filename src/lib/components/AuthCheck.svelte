<script lang="ts">
    import { user } from "$lib/firebase";
</script>
  
  {#if $user}
    <slot />
  {:else}
      <p class="text-error my-10">
          Você precisa estar autenticado para acessar essa página.
          <a class="btn btn-primary" href="/login">Faça seu login</a>
      </p>
  {/if}