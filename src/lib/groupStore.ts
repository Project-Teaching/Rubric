import { writable } from "svelte/store";

// Store global para notificar mudanças nos grupos
export const groupStore = writable<{ refresh: boolean }>({ refresh: false });