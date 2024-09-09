<script lang="ts">
    import { Autocomplete } from '@skeletonlabs/skeleton';
    import type { AutocompleteOption } from '@skeletonlabs/skeleton';
    import { InputChip } from '@skeletonlabs/skeleton';
    
    let inputChip = '';

    let inputChipList: string[] = ['vanilla', 'chocolate'];
    let isAutocompleteVisible = false; // Variável de estado para controlar a visibilidade
    
    const flavorOptions: AutocompleteOption<string>[] = [
        { label: 'Vanilla', value: 'vanilla', keywords: 'plain, basic', meta: { healthy: false } },
        { label: 'Chocolate', value: 'chocolate', keywords: 'dark, white', meta: { healthy: false } },
        { label: 'Strawberry', value: 'strawberry', keywords: 'fruit', meta: { healthy: true } },
        { label: 'Neapolitan', value: 'neapolitan', keywords: 'mix, strawberry, chocolate, vanilla', meta: { healthy: false } },
        { label: 'Pineapple', value: 'pineapple', keywords: 'fruit', meta: { healthy: true } },
        { label: 'Peach', value: 'peach', keywords: 'fruit', meta: { healthy: true } }
    ];
                    
	
    function onInputChipSelect(event: CustomEvent<AutocompleteOption<string>>): void {
        inputChipList = [...inputChipList, event.detail.value];
        isAutocompleteVisible = false; // Fecha o autocomplete após a seleção
    }

    function onFocus() {
        isAutocompleteVisible = true; // Exibe o autocomplete quando o input ganha foco
    }

    function onBlur() {
        setTimeout(() => isAutocompleteVisible = false, 200); // Esconde o autocomplete quando o input perde foco, com atraso para evitar fechamento antes da seleção
    }

</script>

<InputChip 
    bind:input={inputChip} 
    bind:value={inputChipList} 
    name="chips"
    class="dark:bg-dark-secondary border-none max-w-56"
    on:focus={onFocus}
    on:blur={onBlur} />


<div class="card w-ful max-w-sm max-h-48 p-4 overflow-y-auto" tabindex="-1" class:hidden={!isAutocompleteVisible}>
	<Autocomplete
		bind:input={inputChip}
		options={flavorOptions}
		denylist={inputChipList}
		on:selection={onInputChipSelect}
	/>
</div>

<style>
    div.h-0.overflow-hidden {
        display: none !important;
    }
</style>