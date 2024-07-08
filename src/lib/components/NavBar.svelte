<script>
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



<div class="navbar bg-base-100 main-navbar-h">
  <div class="flex-1">
    <label for="my-drawer" class="btn btn-ghost text-xl drawer-button">||| Rubric</label>
  </div>
  <div class="flex-none gap-2">
      {#if $user}
        <div class="font-bold">
          {$user.displayName}
        </div>
        <div class="dropdown dropdown-end">
              <div tabindex="0" role="button" class="btn btn-ghost btn-circle avatar">
                <div class="w-10 rounded-full">
                  <img
                    alt="User Profile"
                    src={$user.photoURL ?? "/user.png"}/>
                </div>
              </div>
            <ul tabindex="0" class="menu menu-sm dropdown-content bg-base-100 rounded-box z-[1] mt-3 w-52 p-2 shadow">
            <li>
              <a class="justify-between">
                Perfil
                <!--<span class="badge">New</span>-->
              </a>
            </li>
            <li><button on:click={signOutSSR}>Sair</button></li>
          </ul>
        </div>
      {:else}
        <button on:click={signInWithGoogle} class="btn btn-ghost">Login</button>
        <div tabindex="0" role="button" class="btn btn-ghost btn-circle avatar">
          <div class="w-10 rounded-full">
            <img
              alt="User Profile"
              src="/user.png" />
          </div>
        </div>
      {/if}
  </div>
</div>