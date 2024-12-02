<script lang="ts">
    let userMessage = '';
    let chatHistory: { sender: 'user' | 'bot'; text: string }[] = [];
    let suggestedQuestion = '';
    let answer = '';
    let showSuggestion = false;
  
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
  
        if (response.ok) {
          // Exibir a pergunta sugerida e a resposta correspondente
          suggestedQuestion = data.suggestedQuestion;
          answer = data.answer;
          showSuggestion = true; // Mostrar o botão "Sim"
        } else {
          // Exibir erro caso não haja correspondência
          chatHistory = [
            ...chatHistory,
            { sender: 'bot', text: data.error || 'Não entendi sua pergunta.' }
          ];
        }
      } catch (err) {
        console.error('Erro ao enviar mensagem:', err);
        chatHistory = [
          ...chatHistory,
          { sender: 'bot', text: 'Erro ao processar a mensagem.' }
        ];
      }
  
      userMessage = '';
    }
  
    function confirmSuggestion() {
      if (suggestedQuestion && answer) {
        // Adicionar a resposta ao histórico
        chatHistory = [...chatHistory, { sender: 'bot', text: `${answer}` }];
      }
      showSuggestion = false; // Ocultar o botão "Sim"
      suggestedQuestion = '';
      answer = '';
    }
  </script>
  
  <div class="m-auto rounded-lg bg-secondary-500 dark:bg-dark-secondary p-8 min-h-64 w-[50%]">
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
      </div>
    {/if}
  
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
  