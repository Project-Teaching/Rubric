<script lang="ts">
  import { page } from "$app/stores";
  import Breadcrumbs from '$lib/components/Breadcrumbs.svelte';
  import NavBar from "$lib/components/NavBar.svelte";
  import Footer from "$lib/components/Footer.svelte";
  import Drawer from "$lib/components/Drawer.svelte";
  import { db } from "$lib/firebase";
  import { collection, addDoc, query, where, getDocs, doc, updateDoc, arrayUnion } from "firebase/firestore";
  import { goto } from "$app/navigation";

  interface Aluno {
    nome: string;
    sobrenome: string;
    matricula: string;
    email: string;
    grupo?: string;
  }

  let alunosCSV: Aluno[] = [];
  let file: File | null = null;
  let isLoading = false;
  let uploadMessage: string | null = null;

  // Extraindo class_id da URL
  let classId: string;
  $: {
    classId = $page.url.searchParams.get('class_id') || '';
  }
  const handleFileUpload = (event: Event) => {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      file = input.files[0];
    }
  };

  const processCSV = (csv: string): Aluno[] => {
    const lines = csv.split("\n");
    const result: Aluno[] = [];
    const headers = lines[0].split(",");

    for (let i = 1; i < lines.length; i++) {
      const currentLine = lines[i].split(",");
      if (
        currentLine.length < 4 ||
        currentLine.every((field) => field.trim() === "")
      ) {
        continue;
      }

      const aluno: Aluno = {
        nome: currentLine[0].trim(),
        sobrenome: currentLine[1].trim(),
        matricula: currentLine[2].trim(),
        email: currentLine[3].trim(),
        grupo: currentLine[4]?.trim() || "",
      };

      result.push(aluno);
    }
    return result;
  };

  async function salvarAlunoNaClasseEAtualizar(alunoId: string) {
  if (!classId) {
    throw new Error("ID da classe não fornecido.");
  }

  const classRef = doc(db, "classes", classId);
  const studentRef = doc(db, "students", alunoId);

  try {
    // Atualiza o documento da classe, adicionando o ID do aluno
    await updateDoc(classRef, {
      students: arrayUnion(alunoId), // Adiciona apenas IDs únicos
    });

    // Atualiza o documento do aluno, adicionando o ID da classe
    await updateDoc(studentRef, {
      classes: arrayUnion(classId), // Adiciona apenas IDs únicos
    });
  } catch (error) {
    console.error("Erro ao atualizar vínculos:", error);
    throw new Error("Erro ao vincular o aluno à classe.");
  }
}

async function salvarAlunosNoFirebase(alunos: Aluno[]): Promise<string[]> {
  const studentsCollection = collection(db, "students");
  let mensagens: string[] = [];

  for (let aluno of alunos) {
    try {
      // Verifica se o aluno já existe pelo número de matrícula
      const q = query(
        studentsCollection,
        where("matricula", "==", aluno.matricula)
      );
      const querySnapshot = await getDocs(q);

      if (!querySnapshot.empty) {
        const existingAlunoId = querySnapshot.docs[0].id;

        // Atualiza a classe para vincular o aluno existente
        await salvarAlunoNaClasseEAtualizar(existingAlunoId);
        mensagens.push(
          `Aluno ${aluno.nome} já existente vinculado à classe.`
        );
        continue;
      }

      // Salva um novo aluno no Firestore
      const docRef = await addDoc(studentsCollection, aluno);
      mensagens.push(`Aluno ${aluno.nome} salvo com sucesso!`);

      // Atualiza a classe e o aluno com o vínculo
      await salvarAlunoNaClasseEAtualizar(docRef.id);
      mensagens.push(`Aluno ${aluno.nome} vinculado à classe com sucesso.`);
    } catch (error) {
      mensagens.push(
        `Erro ao processar o aluno ${aluno.nome}: ${error instanceof Error ? error.message : error}`
      );
    }
  }

  return mensagens;
}



  const handleSubmit = async () => {
    if (file) {
      isLoading = true;
      uploadMessage = null;
      const reader = new FileReader();

      reader.onload = async (event: ProgressEvent<FileReader>) => {
        if (event.target && typeof event.target.result === "string") {
          const csvData = event.target.result;
          alunosCSV = processCSV(csvData);

          try {
            const mensagens = await salvarAlunosNoFirebase(alunosCSV);
            uploadMessage = mensagens.join("\n");
          } catch (error) {
            uploadMessage = "Erro ao salvar os alunos.";
          } finally {
            isLoading = false;
          }
        }
      };

      reader.readAsText(file);
    } else {
      uploadMessage = "Por favor, selecione um arquivo.";
    }
  };

  function irParaFormulario() {
    goto("/discentes/form_discente");
  }
</script>

<svelte:head>
  <title>Rubric Pro</title>
</svelte:head>

<main class="flex dark:bg-dark-surface flex-col min-h-screen">
  <NavBar></NavBar>
  <Breadcrumbs />
  <div class="flex-grow main-content">
    <div class="drawer">
      <input id="my-drawer" type="checkbox" class="drawer-toggle" />
      <div class="drawer-content">
        <div class="h-2 flex justify-center text-center">
          <h1 class="text-2xl font-bold text-primary-500">Adicionar Alunos via CSV</h1>
        </div>
        <section class="container mx-auto mt-16 mb-10 min-h-[50vh]">
          <div class="flex flex-col justify-center items-center">
            <form on:submit|preventDefault={handleSubmit}>
              <input type="file" accept=".csv" on:change={handleFileUpload} />
              <button class="btn variant-filled-primary" type="submit" disabled={isLoading}>
                {#if isLoading} Processando... {/if}
                {!isLoading && "Upload CSV e Salvar"}
              </button>
            </form>

            {#if uploadMessage}
              <div class="mt-4">
                {#each uploadMessage.split("\n") as message}
                  <p class="{message.includes('sucesso') ? 'text-green-600' : 'text-red-600'}">
                    {message}
                  </p>
                {/each}
              </div>
            {/if}

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
