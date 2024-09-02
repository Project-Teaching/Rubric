<script>
  import NavBar from "$lib/components/NavBar.svelte";
  import Footer from "$lib/components/Footer.svelte";
    import Drawer from "$lib/components/Drawer.svelte";
</script>

  <main class="flex flex-col min-h-screen">
    <NavBar></NavBar>
    <div class="flex-grow main-content">
      <div class="drawer">
        <input id="my-drawer" type="checkbox" class="drawer-toggle" />
        <div class="drawer-content">
          <!-- Conteúdo principal aqui -->
          <div class="p-content"> <!-- Bloco de Texto Principal 1 -->
            <h1 class="text-2xl font-bold text-primary">Rubricas de Avaliação</h1>
            <p class="py-4 text-1xl">Venha descobrir este método de avaliação que facilita seu trabalho e o entendimento de seus alunos.</p>
          </div>
          <div class="m-page-content"> <!-- Bloco de Texto Principal 2 -->
            <div class="p-content">
              <h1 class="text-2xl font-bold text-primary">O que são rubricas de avaliação?</h1>
              <p class="py-4 text-1xl">Rubricas de avaliação definem as expectativas das tarefas em um modelo de matriz, tornando a avaliação dos alunos muito eficaz em termos de automação e produtividade...</p>
              <a href="/rubricas" class="text-primary font-bold text-1xl">&lt; Ver mais &gt;</a>
            </div>
            <div class="p-content">
              <h1 class="text-2xl font-bold text-primary">Como funciona nosso aplicativo?</h1>
              <p class="py-4 text-1xl">O “nome” é um sistema que permite a criação e gerenciamento de rubricas de avaliação. Utilizando nosso aplicativo você terá uma facilidade maior na criação de suas rubricas de avaliação personalizadas e poderá aplicar as mesmas por dentro do sistema</p>
            </div>
          </div>
          <div class="p-content"> <!-- Bloco de Rubric Models -->
            <div class="stack model-preview-group">
              <div class="card bg-secondary text-primary-content shadow-md rubric-model-preview rmp-1">
                <div class="card-body">
                  <h2 class="card-title">Modelo de Rubrica</h2>
                </div>
              </div>
              <div class="card bg-secondary text-primary-content shadow-md rubric-model-preview rmp-2">
                <div class="card-body">
                  <h2 class="card-title">Modelo de Rubrica</h2>
                </div>
              </div>
              <div class="card bg-secondary text-primary-content shadow-md rubric-model-preview rmp-3">
                <div class="card-body">
                  <h2 class="card-title">Modelo de Rubrica</h2>
                </div>
              </div>
            </div>
            <div class="rubric-model-preview-text">
              <h1 class="text-2xl font-bold text-primary">Começe Agora Mesmo!</h1>
              <a href="/rubricas/" class="text-primary font-bold text-1xl">Clique aqui para criar sua primeira rubrica de avaliação</a>
            </div>
          </div> 
        </div>
        <Drawer></Drawer>
      </div>
    </div>
    <Footer></Footer>
  </main>
  
  