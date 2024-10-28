<script lang="ts">
  import NavBar from "$lib/components/NavBar.svelte";
  import Footer from "$lib/components/Footer.svelte";
  import Drawer from "$lib/components/Drawer.svelte";
  import { db } from "$lib/firebase";
  import { collection, addDoc } from "firebase/firestore";
  import { goto } from "$app/navigation";

  interface Aluno {
    nome: string;
    sobrenome: string;
    matricula: string;
    email: string;
    grupo?: string;
  }

  let alunosCSV: Aluno[] = []; // Lista temporária para armazenar alunos do CSV
  let file: File | null = null;

  // Função para lidar com o upload do arquivo
  const handleFileUpload = (event: Event) => {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      file = input.files[0];
    }
  };

  // Função para processar o CSV
  const processCSV = (csv: string): Aluno[] => {
    const lines = csv.split("\n");
    const result: Aluno[] = [];

    const headers = lines[0].split(","); // Assume que a primeira linha contém os cabeçalhos

    for (let i = 1; i < lines.length; i++) {
      const currentLine = lines[i].split(",");

      // Verifica se a linha está vazia ou mal formatada
      if (
        currentLine.length < 4 ||
        currentLine.every((field) => field.trim() === "")
      ) {
        continue; // Ignora linhas completamente vazias ou mal formatadas
      }

      const aluno: Aluno = {
        nome: currentLine[0].trim(),
        sobrenome: currentLine[1].trim(),
        matricula: currentLine[2].trim(),
        email: currentLine[3].trim(),
        grupo: currentLine[4]?.trim() || "", // Se o grupo estiver vazio ou indefinido, define como string vazia
      };

      result.push(aluno);
    }
    return result;
  };

  // Função para salvar os alunos no Firebase
  async function salvarAlunosNoFirebase(alunos: Aluno[]) {
    const studentsCollection = collection(db, "students");
    for (let aluno of alunos) {
      try {
        await addDoc(studentsCollection, aluno);
        console.log(
          `Aluno ${aluno.nome} ${aluno.sobrenome} salvo com sucesso!`
        );
      } catch (error) {
        console.error(`Erro ao salvar o aluno ${aluno.nome}:`, error);
      }
    }
  }

  // Função para processar e salvar o CSV no Firebase
  const handleSubmit = async () => {
    if (file) {
      const reader = new FileReader();
      reader.onload = function (event: ProgressEvent<FileReader>) {
        if (event.target && typeof event.target.result === "string") {
          const csvData = event.target.result;
          alunosCSV = processCSV(csvData); // Processa o CSV
          salvarAlunosNoFirebase(alunosCSV); // Salva os alunos no Firebase
        }
      };
      reader.readAsText(file);
    }
  };

  function irParaFormulario() {
    goto("/discentes/form_discente"); // Caminho da página de cadastro por formulário
  }
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
        <div class="h-2 flex justify-center text-center"> <!-- Bloco de Texto Principal 1 -->
          <h1 class="text-2xl font-bold text-primary-500">Adicionar Alunos via CSV</h1>
        </div>
        <section class="container mx-auto mt-16 mb-10 min-h-[50vh]">
          <!-- Layout da página de upload de CSV -->
          <div class="flex flex-col justify-center items-center">
            
            <!-- Formulário para upload de CSV -->
            <form on:submit|preventDefault={handleSubmit}>
              <input type="file" accept=".csv" on:change={handleFileUpload} />
              <button class="btn variant-filled-primary" type="submit">Upload CSV e Salvar</button>
            </form>
          
            <!-- Botão para redirecionar para o formulário de cadastro manual -->
            <button
              on:click={irParaFormulario}
              class="btn variant-filled-primary mt-12"
            >
              Adicionar via Formulário
            </button>
          </div>
        </section>
      </div>
      <Drawer></Drawer>
    </div>
  </div>
  <Footer></Footer>
</main>
