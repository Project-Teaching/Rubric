<script lang="ts">
  import { page } from "$app/stores";
  import Breadcrumbs from "$lib/components/Breadcrumbs.svelte";
  import NavBar from "$lib/components/NavBar.svelte";
  import Footer from "$lib/components/Footer.svelte";
  import Drawer from "$lib/components/Drawer.svelte";
  import { db } from "$lib/firebase";
  import {
    collection,
    addDoc,
    query,
    where,
    getDocs,
    doc,
    updateDoc,
    arrayUnion,
  } from "firebase/firestore";

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
    classId = $page.url.searchParams.get("class_id") || "";
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
          mensagens.push(`Aluno ${aluno.nome} vinculado à classe com sucesso.`);
          continue;
        }

        // Salva um novo aluno no Firestore
        const docRef = await addDoc(studentsCollection, aluno);
        console.log(`Aluno ${aluno.nome} salvo com sucesso!`);

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

  // Dados do aluno a ser adicionado manualmente
  let aluno: Aluno = {
    nome: "",
    sobrenome: "",
    matricula: "",
    email: "",
    grupo: "",
  };

  // Função para adicionar aluno manualmente
  const addAluno = async (aluno: Aluno) => {
    const mensagens = await salvarAlunosNoFirebase([aluno]);
    mensagens.forEach((msg) => console.log(msg));
    alert(mensagens.join("\n"));
  };

  const handleSubmitForm = async (event: Event) => {
    event.preventDefault();
    await addAluno(aluno);

    // Redefinir os campos do formulário
    aluno = {
      nome: "",
      sobrenome: "",
      matricula: "",
      email: "",
      grupo: "",
    };
  };
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
          <h1 class="text-2xl font-bold text-primary-500">
            Adicionar Novo Aluno
          </h1>
        </div>
        <section class="container mx-auto mt-16 mb-10 min-h-[50vh]">
          <!-- Formulário para adicionar alunos -->
          <div class="flex justify-center items-center">
            <form
              class="form w-[50%] h-[65vh] justify-center bg-secondary-500 dark:bg-dark-secondary p-5 rounded-xl"
              on:submit|preventDefault={handleSubmitForm}
            >
              <div class="flex justify-center items-center w-full p-4">
                <label>
                  <span class="font-semibold">Nome</span>
                  <input
                    type="text"
                    bind:value={aluno.nome}
                    class="input bg-secondary-200 dark:bg-dark-surface border-b-2 border-t-0 border-l-0 border-r-0 rounded-md w-[90%]"
                    required
                  />
                </label>
                <label>
                  <span class="font-semibold">Sobrenome</span>
                  <input
                    type="text"
                    bind:value={aluno.sobrenome}
                    class="input bg-secondary-200 dark:bg-dark-surface border-b-2 border-t-0 border-l-0 border-r-0 rounded-md w-[90%]"
                    required
                  />
                </label>
              </div>
              <div class="flex justify-center items-center w-full p-4">
                <label>
                  <span class="font-semibold">Matrícula</span>
                  <input
                    type="text"
                    bind:value={aluno.matricula}
                    class="input bg-secondary-200 dark:bg-dark-surface border-b-2 border-t-0 border-l-0 border-r-0 rounded-md w-[90%]"
                    required
                  />
                </label>
                <label>
                  <span class="font-semibold">Email</span>
                  <input
                    type="email"
                    bind:value={aluno.email}
                    class="input bg-secondary-200 dark:bg-dark-surface border-b-2 border-t-0 border-l-0 border-r-0 rounded-md w-[90%]"
                    required
                  />
                </label>
              </div>
              <div class="flex justify-center items-center w-full p-4">
                <label>
                  <span class="font-semibold">Grupo</span>
                  <input
                    type="text"
                    bind:value={aluno.grupo}
                    class="input bg-secondary-200 dark:bg-dark-surface border-b-2 border-t-0 border-l-0 border-r-0 rounded-md w-[90%]"
                  />
                </label>
              </div>
              <div class="flex justify-center items-center w-full p-4">
                <button class="btn variant-filled-primary center" type="submit">
                  Adicionar Aluno
                </button>
              </div>
            </form>
          </div>
        </section>
        <div class="ch-2 flex justify-center text-center">
          <h2 class="text-2xl font-bold text-primary-500">
            Adicionar Alunos via CSV
          </h2>
        </div>
        <section class="container mx-auto mt-16 mb-10 min-h-[50vh]">
          <div class="flex flex-col justify-center items-center">
            <form on:submit|preventDefault={handleSubmit}>
              <input type="file" accept=".csv" on:change={handleFileUpload} />
              <button
                class="btn variant-filled-primary"
                type="submit"
                disabled={isLoading}
              >
                {#if isLoading}
                  Processando...
                {/if}
                {!isLoading && "Upload CSV e Salvar"}
              </button>
            </form>

            {#if uploadMessage}
              <div class="mt-4">
                {#each uploadMessage.split("\n") as message}
                  <p
                    class={message.includes("sucesso")
                      ? "text-green-600"
                      : "text-red-600"}
                  >
                    {message}
                  </p>
                {/each}
              </div>
            {/if}
          </div>
        </section>
      </div>
      <Drawer></Drawer>
    </div>
  </div>
  <Footer></Footer>
</main>
