<script>
  import { page } from '$app/stores';
  import { derived } from 'svelte/store';
  import { t } from 'svelte-i18n'; // Importe a função de tradução
  //@ts-ignore
  import IoMdHome from 'svelte-icons/io/IoMdHome.svelte';

  // Função para gerar breadcrumbs a partir da URL
  /**
     * @param {string} pathname
     * @param {URLSearchParams} queryParams
     */
  function generateBreadcrumbs(pathname, queryParams) {
    const segments = pathname.split('/').filter(Boolean);
    const breadcrumbs = segments.map((/** @type {string} */ segment, /** @type {number} */ index) => {
      if (isId(segment)) {
        return { 
          segment: null, 
          href: '/' + segments.slice(0, index + 1).join('/') + buildQueryString(queryParams), 
          isCurrent: index === segments.length - 1 
        };
      }

      // Traduz o segmento
      const translatedSegment = $t(decodeURIComponent(segment)) || capitalize(decodeURIComponent(segment));

      return { 
        segment: translatedSegment, 
        href: '/' + segments.slice(0, index + 1).join('/') + buildQueryString(queryParams), 
        isCurrent: index === segments.length - 1 
      };
    }).filter((/** @type {{ segment: any; }} */ breadcrumb) => breadcrumb.segment); // Filtra breadcrumbs sem segmento

    return breadcrumbs;
  }

  // Função para construir a query string com base nos parâmetros
  /**
     * @param {string | string[][] | Record<string, string> | URLSearchParams | undefined} params
     */
  function buildQueryString(params) {
    const query = new URLSearchParams(params);
    return query.toString() ? `?${query.toString()}` : '';
  }

  /**
     * @param {string} string
     */
  function capitalize(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
  }

  /**
     * @param {string | any[]} segment
     */
  function isId(segment) {
    // @ts-ignore
    return segment.length === 20 && /^[A-Za-z0-9]+$/.test(segment); // Exemplo para IDs do Firebase
  }

  // Store derivada para os breadcrumbs
  const breadcrumbs = derived(page, $page => generateBreadcrumbs($page.url.pathname, $page.url.searchParams));
</script>

<ol class="breadcrumb mt-2">
  <li class="crumb">
    <a href="/">
      <div class="ml-2 w-6"><IoMdHome /> </div>
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
