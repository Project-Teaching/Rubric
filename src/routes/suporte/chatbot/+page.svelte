<script>
    import NavBar from "$lib/components/NavBar.svelte";
    import Footer from "$lib/components/Footer.svelte";
    import Drawer from "$lib/components/Drawer.svelte";
    import Chatbot from "$lib/components/chatbot/Chatbot.svelte";
  </script>
  
  <svelte:head>
    <title>Rubric Pro</title>
  </svelte:head>
  
    <main class="flex dark:bg-dark-surface flex-col min-h-screen">
      <NavBar></NavBar>
      <div class="flex-grow main-content">
        <div class="drawer">
          <input id="my-drawer" type="checkbox" class="drawer-toggle" />
          <div class="drawer-content">
            <!-- Conteúdo principal aqui -->
            <Chatbot></Chatbot>
          </div>
          <Drawer></Drawer>
        </div>
      </div>
      <Footer></Footer>
    </main>
    
  