<script lang="ts">
  import { afterUpdate } from 'svelte';

  let userMessage = '';
  let chatHistory: { sender: 'user' | 'bot'; text: string }[] = [];
  let suggestions: { question: string; answer: string }[] = [];
  let suggestionIndex = 0;
  let suggestedQuestion = '';
  let answer = '';
  let showSuggestion = false;
  
  let messagesContainer: HTMLElement;

  async function sendMessage() {
    if (userMessage.trim() === '') return;

    // Adicionar mensagem do usuário ao histórico
    chatHistory = [...chatHistory, { sender: 'user', text: userMessage }];

    // Enviar mensagem para o servidor
    try {
      const response = await fetch('/api/chatbot', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userMessage })
      });

      const data = await response.json();

      if (response.ok && data.suggestions?.length > 0) {
        // Salvar sugestões e exibir a primeira
        suggestions = data.suggestions;
        suggestionIndex = 0;
        showSuggestionCard(suggestions[suggestionIndex]);
      } else {
        chatHistory = [...chatHistory, { sender: 'bot', text: data.error || 'Não entendi sua pergunta.' }];
      }
    } catch (err) {
      console.error('Erro ao enviar mensagem:', err);
      chatHistory = [...chatHistory, { sender: 'bot', text: 'Erro ao processar a mensagem.' }];
    }

    userMessage = '';
  }

  function showSuggestionCard(suggestion: { question: string; answer: string }) {
    suggestedQuestion = suggestion.question;
    answer = suggestion.answer;
    showSuggestion = true;
  }

  function confirmSuggestion() {
    if (suggestedQuestion && answer) {
      // Adicionar a resposta ao histórico
      chatHistory = [...chatHistory, { sender: 'bot', text: `${answer}` }];
    }
    resetSuggestion();
  }

  async function rejectSuggestion() {
    suggestionIndex++;
    if (suggestionIndex < suggestions.length) {
      showSuggestionCard(suggestions[suggestionIndex]);
    } else {
      chatHistory = [...chatHistory, { sender: 'bot', text: 'Não encontramos outra sugestão.' }];
      resetSuggestion();
    }
  }

  function resetSuggestion() {
    showSuggestion = false;
    suggestedQuestion = '';
    answer = '';
  }

  // Função que rola para a última mensagem
  afterUpdate(() => {
    if (messagesContainer) {
      messagesContainer.scrollTop = messagesContainer.scrollHeight;
    }
  });
</script>

<div class="m-auto rounded-lg bg-secondary-500 dark:bg-dark-secondary p-8 min-h-64 w-[50%]">
  <div class="m-auto max-h-[20rem] min-h-[20rem] overflow-y-auto overflow-x-auto" bind:this={messagesContainer}>
    {#each chatHistory as message}
      <div class={`message ${message.sender} my-2 p-2 rounded-md ${message.sender === 'user' ? 'bg-primary-700 text-white' : 'bg-secondary-200 text-black ml-[40%]'}`}>
        {message.sender === 'user' ? 'Você: ' : 'Chatbot: '}{message.text}
      </div>
    {/each}

    <!-- Exibir sugestão de pergunta -->
    {#if showSuggestion}
      <div class="suggestion mt-4">
        <p class="mb-2">Você quis dizer: "{suggestedQuestion}"?</p>
        <button class="bg-green-500 text-white p-2 rounded-md" on:click={confirmSuggestion}>Sim</button>
        <button class="bg-red-500 text-white p-2 rounded-md" on:click={rejectSuggestion}>Não</button>
      </div>
    {/if}
  </div>

  <div class="flex flex-col mt-8">
    <input
      class="p-2 m-2 bg-secondary-200 dark:bg-dark-surface border rounded-md"
      type="text"
      placeholder="Digite sua pergunta..."
      bind:value={userMessage}
      on:keypress={(e) => e.key === 'Enter' && sendMessage()}
    />
    <button class="bg-primary-500 rounded-md p-2 m-2" on:click={sendMessage}>Enviar</button>
  </div>
</div>

<style>
  .message {
    max-width: 80%;
  }

  .message.user {
    align-self: flex-end;
  }

  .message.bot {
    align-self: flex-start;
  }
</style>