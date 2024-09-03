<script>
  import { page } from '$app/stores';
  import { derived } from 'svelte/store';

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
     * @param {string} segment
     */
  function isId(segment) {
    // Ajuste a lógica conforme necessário para identificar IDs
    return segment.length === 20 && /^[A-Za-z0-9]+$/.test(segment); // Exemplo para IDs do Firebase
  }

  // Store derivada para os breadcrumbs
  const breadcrumbs = derived(page, $page => generateBreadcrumbs($page.url.pathname));
</script>

<div class="breadcrumbs text-sm ml-3">
  <ul>
    <li><a href="/">Home</a></li>
    {#each $breadcrumbs as { segment, href, isCurrent }}
      <li class={isCurrent ? 'text-neutral font-bold' : ''}>
        {#if isCurrent}
          {segment}
        {:else}
          <a href={href}>{segment}</a>
        {/if}
      </li>
    {/each}
  </ul>
</div>