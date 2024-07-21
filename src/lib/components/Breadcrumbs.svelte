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
      const href = '/' + segments.slice(0, index + 1).join('/');
      return { 
        segment: capitalize(decodeURIComponent(segment)), 
        href, 
        isCurrent: index === segments.length - 1 
      };
    });
    return breadcrumbs;
  }

  // Função para capitalizar a primeira letra
  /**
     * @param {string} string
     */
  function capitalize(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
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