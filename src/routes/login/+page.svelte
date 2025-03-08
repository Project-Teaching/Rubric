<script lang="ts">
    import { auth, user } from "$lib/firebase";

    import {
        GoogleAuthProvider,
        signInWithPopup,
        signOut,
    } from "firebase/auth";

    async function signInWithGoogle() {
        const provider = new GoogleAuthProvider();
        const credential = await signInWithPopup(auth, provider);

        const idToken = await credential.user.getIdToken();

        const res = await fetch("/api/signin", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                // 'CSRF-Token': csrfToken  // HANDLED by sveltekit automatically
            },
            body: JSON.stringify({ idToken }),
        });
    }

    async function signOutSSR() {
        const res = await fetch("/api/signin", { method: "DELETE" });
        await signOut(auth);
    }
</script>

<h2>Login</h2>

{#if $user}
    <h2 class="card-title">Bem vindo, {$user.displayName}</h2>
    <p class="text-center text-success">Você está logado</p>
    <button class="btn btn-warning" on:click={signOutSSR}>Sair</button>
{:else}
    <button class="btn btn-primary" on:click={signInWithGoogle}
        >Entrar com o Google</button
    >
{/if}
