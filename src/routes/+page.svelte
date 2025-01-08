<script>
  import NavBar from "$lib/components/NavBar.svelte";
  import Footer from "$lib/components/Footer.svelte";
    import Drawer from "$lib/components/Drawer.svelte";
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
          <div class="p-content"> <!-- Bloco de Texto Principal 1 -->
            <h1 class="text-2xl font-bold text-primary-500">Rubricas de Avaliação</h1>
            <p class="py-4 text-base">Venha descobrir este método de avaliação que facilita seu trabalho e o entendimento de seus alunos.</p>
          </div>
          <div class="m-page-content"> <!-- Bloco de Texto Principal 2 -->
            <div class="p-content">
              <h1 class="text-2xl font-bold text-primary-500">O que são rubricas de avaliação?</h1>
              <p class="py-4 text-base">Rubricas de avaliação definem as expectativas das tarefas em um modelo de matriz, tornando a avaliação dos alunos muito eficaz em termos de automação e produtividade...</p>
              <a href="/rubricas" class="text-primary-500 font-bold text-base">&lt; Ver mais &gt;</a>
            </div>
            <div class="p-content">
              <h1 class="text-2xl font-bold text-primary-500">Como funciona nosso aplicativo?</h1>
              <p class="py-4 text-base">O RubricPro é um sistema que permite a criação e gerenciamento de rubricas de avaliação. Utilizando nosso aplicativo você terá uma facilidade maior na criação de suas rubricas de avaliação personalizadas e poderá aplicar as mesmas por dentro do sistema</p>
            </div>
          </div>
          <div class="p-content"> <!-- Bloco de Rubric Models -->
            <div class="stack model-preview-group">
              <div class="card-daisy bg-secondary-500 text-primary-500-content shadow-md rubric-model-preview rmp-1">
                <div class="card-body">
                  <h2 class="card-title">Modelo de Rubrica</h2>
                </div>
              </div>
              <div class="card-daisy bg-secondary-500 text-primary-500-content shadow-md rubric-model-preview rmp-2 dark:bg-orange-200">
                <div class="card-body">
                  <h2 class="card-title">Modelo de Rubrica</h2>
                </div>
              </div>
              <div class="card-daisy bg-secondary-500 text-primary-500-content shadow-md rubric-model-preview rmp-3 dark:bg-dark-tertiary">
                <div class="card-body">
                  <h2 class="card-title">Modelo de Rubrica</h2>
                </div>
              </div>
            </div>
            <div class="rubric-model-preview-text">
              <h1 class="text-2xl font-bold text-primary-500">Começe Agora Mesmo!</h1>
              <a href="/rubricas/" class="text-primary-500 font-bold text-base">Clique aqui para criar sua primeira rubrica de avaliação</a>
            </div>
          </div> 
        </div>
        <Drawer></Drawer>
      </div>
    </div>
    <Footer></Footer>
  </main>
  
  