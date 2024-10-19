<script lang="ts">
    export let label_name: any, input_name: any, placeholder: any, input_value_true: any, input_value_ds: any, input_type: any, disabled: any;
</script>

{#if disabled == 'true'}
    <label class="label ml-4 w-[90%]">
        <span class="font-semibold">{label_name}</span>
        <input type="{input_type}" value="{input_value_ds}" class="input bg-secondary-200 dark:bg-dark-surface border-b-2 border-t-0 border-l-0 border-r-0 rounded-md w-[90%]" disabled />
        <input type="hidden" value="{input_value_true}" name="{input_name}" />
    </label>
{:else}
    <label class="label ml-4 w-[90%]">
        <span class="font-semibold">{label_name}</span>
        <input type="{input_type}" name="{input_name}" placeholder="{placeholder}" value={input_value_true} class="input bg-secondary-200 dark:bg-dark-surface border-b-2 border-t-0 border-l-0 border-r-0 rounded-md w-[90%]" required />
    </label>
{/if}