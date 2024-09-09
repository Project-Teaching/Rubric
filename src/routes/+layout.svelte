<script lang="ts">
    import { user, userData } from "$lib/firebase";
    import "../app.css";
    import { initializeStores, Toast } from '@skeletonlabs/skeleton';

    initializeStores();
 
    $user;
    $userData; 
 </script>
 
 <div class="min-h-screen flex flex-col">
     <slot />
 </div>