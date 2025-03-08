import { json } from '@sveltejs/kit';
import chatbotConfig from '../../../lib/components/chatbot/rp_chatbot.json';
import { NlpManager } from 'node-nlp';

// Inicializa o gerenciador NLP
const manager = new NlpManager({ languages: ['pt'] });

// Configura o chatbot com base no JSON
function setupChatbot(config) {
  config.forEach(({ question, answer }) => {
    manager.addDocument('pt', question, question); // Adiciona pergunta
    manager.addAnswer('pt', question, answer);    // Armazena a resposta vinculada
  });
}

// Treina o modelo ao iniciar o servidor
async function trainChatbot() {
  try {
    await manager.train();
    console.log('Modelo treinado com sucesso!');
  } catch (error) {
    console.error('Erro ao treinar o modelo:', error);
  }
}

setupChatbot(chatbotConfig);
trainChatbot();

export async function POST({ request }) {
  try {
    const { userMessage } = await request.json();

    if (!userMessage || userMessage.trim() === '') {
      return json({ error: 'Mensagem vazia.' }, { status: 400 });
    }

    // Processa a mensagem
    const response = await manager.process('pt', userMessage);
    if (response.intent !== 'None') {
      // Mapeia as intenções para respostas usando o chatbotConfig
      const suggestions = response.classifications
        .filter(c => c.score > 0) // Filtra intenções relevantes
        .map(c => {
          const matchedConfig = chatbotConfig.find(item => item.question === c.intent);
          return {
            question: c.intent,
            answer: matchedConfig ? matchedConfig.answer : 'Sem resposta disponível',
            confidence: c.score,
          };
        })
        .sort((a, b) => b.confidence - a.confidence); // Ordena por confiança

      return json({ suggestions });
    }

    return json({ error: 'Nenhuma correspondência encontrada.' }, { status: 404 });
  } catch (error) {
    console.error('Erro no servidor:', error);
    return json({ error: 'Erro interno no servidor.' }, { status: 500 });
  }
}
