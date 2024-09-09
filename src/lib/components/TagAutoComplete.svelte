<script lang="ts">
    import { Autocomplete } from "@skeletonlabs/skeleton";
    import { InputChip } from "@skeletonlabs/skeleton";
    import { get, writable } from "svelte/store";
    import {
        doc,
        getDoc,
        updateDoc,
        getDocs,
        collection,
    } from "firebase/firestore";
    import { db } from "$lib/firebase";
    import { onMount, onDestroy } from "svelte";
    import { Toast, getToastStore } from '@skeletonlabs/skeleton';

    interface Rubric {
        model_name: string;
        course: string[]; // Alterado para array de strings
        major: string[]; // Alterado para array de strings
        uid: string;
        criteria: any[];
        performance_levels: any[];
    }
    interface AutocompleteOption<T> {
        label: string;
        value: T;
        keywords?: string;
        meta?: any;
    }

    export let docId: string;
    export let field: "course" | "major"; // O campo dinâmico: 'course' ou 'major'
    let tagOptions = writable<AutocompleteOption<string>[]>([]);
    let inputChip = "";

    let inputChipList = writable<string[]>([]);
    let isAutocompleteVisible = false; // Variável de estado para controlar a visibilidade

    // Subscribe to inputChipList changes
    const unsubscribe = inputChipList.subscribe((list) => {
        saveRubricField(docId, field, list);
    });

    // Cleanup subscription on component destroy
    onDestroy(() => {
        unsubscribe();
    });

    // Função para buscar as tags da rubrica no Firebase
    async function fetchTags() {
        const docRef = doc(db, "rubrics", docId);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
            const data = docSnap.data() as Rubric;
            // Atualiza o inputChipList com as tags do campo específico (course ou major)
            inputChipList.set(data[field] || []);
        } else {
            console.error("Rubrica não encontrada!");
        }
    }

        // Função para buscar todas as tags no sistema
    async function fetchAllTags(field: "course" | "major") {
        const querySnapshot = await getDocs(collection(db, "rubrics"));
        const tagsSet = new Set<string>(); // Usamos um Set para garantir que não haja duplicatas

        querySnapshot.forEach((doc) => {
            const data = doc.data();
            if (data[field] && Array.isArray(data[field])) {
                data[field].forEach((tag: string) => tagsSet.add(tag));
            }
        });

        // Obter a lista atual de tags
        const currentTags = get(inputChipList);

        // Filtrar as tags já existentes
        const options = Array.from(tagsSet)
            .filter(tag => !currentTags.includes(tag))
            .map(tag => ({
                label: tag,
                value: tag,
                keywords: tag.toUpperCase(),
                meta: {},
            }));

        tagOptions.set(options); // Atualizar a lista de opções
    }

    function onInputChipSelect(event: CustomEvent<AutocompleteOption<string>>) {
        if(isValidTag(event.detail.value)){
            addTag(event.detail.value);
            isAutocompleteVisible = false;
        } else {
            toastStore.trigger({
                message: `"${event.detail.value}" é uma TAG inválida. Deve iniciar com # e todas letras maiúsculas!`,
                background: 'variant-filled-error dark:bg-error-800',
                timeout: 5000
            });
            console.error("Tag inválida!");
        }
    }

    function onFocus() {
        isAutocompleteVisible = true; // Exibe o autocomplete quando o input ganha foco
    }

    function onBlur() {
        setTimeout(() => (isAutocompleteVisible = false), 200); // Esconde o autocomplete quando o input perde foco, com atraso para evitar fechamento antes da seleção
    }

    // CONTROLADORES DAS TAGS - START
    async function saveRubricField(id: string, field: string, value: any) {
        const docRef = doc(db, "rubrics", id);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
            const data = docSnap.data();
            const updatedData = { ...data, [field]: value };
            await updateDoc(docRef, updatedData);
        } else {
            console.error("Documento não encontrado!");
        }
    }

    function addTag(tag: string) {
        inputChipList.update((list) => {
            if (!list.includes(tag)) {
                const updatedList = [...list, tag];
                return updatedList;
            }
            return list;
        });
    }

    // CONTROLADORES DAS TAGS - END

    function isValidTag(value: string): boolean {
	    return value.startsWith('#') && value === value.toUpperCase();
    }  
    const toastStore = getToastStore();

    function onInvalidHandler(event: any): void {
        toastStore.trigger({
            message: `"${event.detail.input}" é uma TAG inválida ou duplicada. <br> Deve iniciar com # e todas letras maiúsculas!`,
            background: 'variant-filled-error dark:bg-error-800',
            timeout: 5000
        });
  }

    // Executa a busca das tags quando o componente é montado
    onMount(() => {
        inputChipList.set([]); // Reseta o estado antes de carregar novos dados
        fetchTags();
        fetchAllTags(field);
    });
</script>

<InputChip
    bind:input={inputChip}
    bind:value={$inputChipList}
    name="chips"
    chips="variant-filled-primary"
    placeholder="Digite a TAG"
    class="dark:bg-dark-secondary bg-secondary-500 font-semibold border-none max-w-80 min-w-80"
    on:focus={onFocus}
    on:blur={onBlur}
    allowUpperCase = {true}
    validation={isValidTag}
    on:invalid={onInvalidHandler}
/>

<div
    class="card w-ful max-w-sm max-h-48 p-4 overflow-y-auto bg-secondary-500 dark:bg-dark-secondary"
    tabindex="-1"
    class:hidden={!isAutocompleteVisible}
>
    <Autocomplete
        bind:input={inputChip}
        options={$tagOptions}
        denylist={$inputChipList}
        on:selection={onInputChipSelect}
    />
</div>

<Toast />

<style>
    div.h-0.overflow-hidden {
        display: none !important;
    }
</style>
