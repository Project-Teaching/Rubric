<script>
  import { page } from '$app/stores';
  import { derived } from 'svelte/store';
  // @ts-ignore
  import IoMdHome from 'svelte-icons/io/IoMdHome.svelte';

  // Função para gerar breadcrumbs a partir da URL
  /**
     * @param {string} pathname
     */
  function generateBreadcrumbs(pathname) {
    const segments = pathname.split('/').filter(Boolean);
    const breadcrumbs = segments.map((segment, index) => {
      // Verifique se o segmento parece ser um ID (você pode ajustar a verificação conforme necessário)
      if (isId(segment)) {
        return { 
          segment: null, 
          href: '/' + segments.slice(0, index + 1).join('/'), 
          isCurrent: index === segments.length - 1 
        };
      }
      return { 
        segment: capitalize(decodeURIComponent(segment)), 
        href: '/' + segments.slice(0, index + 1).join('/'), 
        isCurrent: index === segments.length - 1 
      };
    }).filter(breadcrumb => breadcrumb.segment); // Filtra breadcrumbs sem segmento
    return breadcrumbs;
  }

  // Função para capitalizar a primeira letra
  /**
     * @param {string} string
     */
  function capitalize(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
  }

  // Função para verificar se o segmento parece ser um ID
  /**
     * @param {string | any[]} segment
     */
  function isId(segment) {
    // Ajuste a lógica conforme necessário para identificar IDs
    // @ts-ignore
    return segment.length === 20 && /^[A-Za-z0-9]+$/.test(segment); // Exemplo para IDs do Firebase
  }

  // Store derivada para os breadcrumbs
  const breadcrumbs = derived(page, $page => generateBreadcrumbs($page.url.pathname));
</script>

<ol class="breadcrumb mt-2">
  <li class="crumb">
    <a href="/">
      <div class="ml-2 w-6"><IoMdHome /> </div><!-- Ícone da home -->
    </a>
  </li>
  {#each $breadcrumbs as { segment, href, isCurrent }}
    <li class="crumb-separator" aria-hidden="true">&rsaquo;</li>
    <li class="crumb">
      {#if isCurrent}
        <p class="anchor no-underline font-bold">{segment}</p>
      {:else}
        <a class="font-bold" href={href}>{segment}</a>
      {/if}
    </li>
  {/each}
</ol>
