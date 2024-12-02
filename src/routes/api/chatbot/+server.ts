import { json } from '@sveltejs/kit';
import natural from 'natural';
import rpChatbotConfig from '../../../lib/components/chatbot/rp_chatbot.json';

const { WordTokenizer, PorterStemmerPt } = natural;

export async function POST({ request }) {
  try {
    const { userMessage } = await request.json();
    console.log('Mensagem recebida:', userMessage); // Debug

    if (!userMessage || userMessage.trim() === '') {
      return json({ error: 'Mensagem vazia.' }, { status: 400 });
    }

    // Extrair palavras-chave
    const keywords = extractKeywords(userMessage);
    console.log('Palavras-chave extraídas:', keywords); // Debug

    // Encontrar melhor correspondência
    const bestMatch = findBestMatch(keywords);
    console.log('Melhor correspondência:', bestMatch); // Debug

    if (bestMatch) {
      return json({
        suggestedQuestion: bestMatch.question,
        answer: bestMatch.answer
      });
    }

    return json({ error: 'Nenhuma correspondência encontrada.' }, { status: 404 });
  } catch (err) {
    console.error(err);
    return json({ error: 'Erro interno no servidor.' }, { status: 500 });
  }
}

// Função para extrair palavras-chave
function extractKeywords(message: string): string[] {
    const tokenizer = new WordTokenizer();
    const tokens = tokenizer.tokenize(message.toLowerCase());
    console.log('Tokens:', tokens);
  
    const stemmedWords = tokens.map((word) => PorterStemmerPt.stem(word));
    console.log('Palavras após stemming:', stemmedWords);
  
    return stemmedWords;
  }

// Função para encontrar melhor correspondência
function findBestMatch(keywords: string[]) {
  return rpChatbotConfig.reduce((best, item) => {
    const commonKeywords = item.keywords.filter(kw => keywords.includes(kw));
    if (commonKeywords.length > best.matchCount) {
      return { ...item, matchCount: commonKeywords.length };
    }
    return best;
  }, { question: '', answer: '', keywords: [], matchCount: 0 } as { question: string; answer: string; keywords: string[]; matchCount: number });
}
