<script lang="ts">
  import NavBar from "$lib/components/NavBar.svelte";
  import Footer from "$lib/components/Footer.svelte";
  import Drawer from "$lib/components/Drawer.svelte";
  import { db } from "$lib/firebase";
  import { collection, addDoc } from "firebase/firestore";

  interface Aluno {
    name: string;
    surname: string;
    registration: string;
    email: string;
    group?: string;
  }

  let aluno: Aluno = {
    name: "",
    surname: "",
    registration: "",
    email: "",
    group: "",
  };

  // Função para salvar o aluno no Firebase
  async function salvarAlunoNoFirebase() {
    const studentsCollection = collection(db, "students");
    try {
      await addDoc(studentsCollection, aluno);
      console.log(`Aluno ${aluno.name} ${aluno.surname} salvo com sucesso!`);
    } catch (error) {
      console.error("Erro ao salvar o aluno:", error);
    }
  }

  // Função para lidar com o envio do formulário
  const handleSubmit = async () => {
    await salvarAlunoNoFirebase();
    aluno = { name: "", surname: "", registration: "", email: "", group: "" }; // Limpa o formulário
  };
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
        <div class="h-2 flex justify-center text-center">
          <h1 class="text-2xl font-bold text-primary-500">Novo Discente</h1>
        </div>
        <section class="container mx-auto mt-16 mb-10 min-h-[50vh]">
          <!-- Formulário para adicionar alunos -->
          <div class="flex justify-center items-center">
            <form
              class="form w-[50%] h-[65vh] justify-center bg-secondary-500 dark:bg-dark-secondary p-5 rounded-xl"
              on:submit|preventDefault={handleSubmit}
            >
              <div class="flex justify-center items-center w-full p-4">
                <label>
                  <span class="font-semibold">Nome</span>
                  <input
                    type="text"
                    bind:value={aluno.name}
                    class="input bg-secondary-200 dark:bg-dark-surface border-b-2 border-t-0 border-l-0 border-r-0 rounded-md w-[90%]"
                  />
                </label>
                <label>
                  <span class="font-semibold">Sobrenome</span>
                  <input
                    type="text"
                    bind:value={aluno.surname}
                    class="input bg-secondary-200 dark:bg-dark-surface border-b-2 border-t-0 border-l-0 border-r-0 rounded-md w-[90%]"
                  />
                </label>
              </div>
              <div class="flex justify-center items-center w-full p-4">
                <label>
                  <span class="font-semibold">Matrícula</span>
                  <input
                    type="text"
                    bind:value={aluno.registration}
                    class="input bg-secondary-200 dark:bg-dark-surface border-b-2 border-t-0 border-l-0 border-r-0 rounded-md w-[90%]"
                  />
                </label>
                <label>
                  <span class="font-semibold">Email</span>
                  <input
                    type="email"
                    bind:value={aluno.email}
                    class="input bg-secondary-200 dark:bg-dark-surface border-b-2 border-t-0 border-l-0 border-r-0 rounded-md w-[90%]"
                  />
                </label>
              </div>
              <div class="flex justify-center items-center w-full p-4">
                <label>
                  <span class="font-semibold">Grupo</span>
                  <input
                    type="text"
                    bind:value={aluno.group}
                    class="input bg-secondary-200 dark:bg-dark-surface border-b-2 border-t-0 border-l-0 border-r-0 rounded-md w-[90%]"
                  />
              
               
              </div>
              <div class="flex justify-center items-center w-full p-4">
  
              <button class="btn variant-filled-primary center" type="submit"
              >Adicionar Aluno</button
            >
          </div>
            </form>
          </div>
        </section>
      </div>
      <Drawer></Drawer>
    </div>
  </div>
  <Footer></Footer>
</main>
