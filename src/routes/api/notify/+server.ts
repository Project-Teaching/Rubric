import { json } from "@sveltejs/kit";
import { doc } from "firebase/firestore";

import nodemailer from "nodemailer";
import { getFirestore, doc as firestoreDoc, getDoc } from "firebase/firestore";

const db = getFirestore();

interface Criterion {
  name: string;
  descriptors: string[];
}
interface PerformanceLevel {
  name: string;
  value: number;
}
interface Rubric {
  model_name: string;
  course: string[];
  major: string[];
  uid: string;
  criteria: Criterion[];
  performance_levels: PerformanceLevel[];
  public: boolean;
  version: number;
  original_model: string;
  finished: boolean;
}

export async function POST({ request }) {
  try {
    const { evaluation, students } = await request.json();
    //console.log("📨 Dados recebidos para envio de e-mail:", JSON.stringify({ evaluation, students }, null, 2));

    if (!evaluation || !students) {
      console.error("Dados inválidos:", { evaluation, students });
      return json({ error: "Dados inválidos" }, { status: 400 });
    }
    
    // Configuração do Nodemailer
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: import.meta.env.VITE_RUBRIC_PRO_EMAIL,
        pass: import.meta.env.VITE_RUBRIC_PRO_EM_PASSWORD,
      },
    });

    async function fetchRubric(rubricId: string) {
      const rubricRef = doc(db, "rubrics", rubricId);
      const rubricSnap = await getDoc(rubricRef);
    
      if (rubricSnap.exists()) {
        return rubricSnap.data() as Rubric; // Retorna os dados da rubrica
      } else {
        console.error("Rubrica não encontrada.");
        return null;
      }
    }

    function generateRubricHTML(rubric: Rubric, rubricEvaluation: any[]) {
      // Verifica se há dados de rubrica
      if (!rubric || !rubricEvaluation) {
        return "<p>Nenhum critério avaliado.</p>";
      }
    
      // Mapeia os níveis selecionados para fácil acesso
      const selectedLevels: { [key: number]: number } = {};
      rubricEvaluation.forEach((evaluation) => {
        selectedLevels[evaluation.criterion_number - 1] = evaluation.level_number - 1; // Ajusta para índice 0
      });
    
      // Cria a tabela HTML da rubrica
      let rubricHTML = `
        <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px;">
          <thead>
            <tr style="background-color: #d26a0b; color: white;">
              <th style="padding: 10px; text-align: left;">Critérios</th>
      `;
    
      // Cabeçalho com os níveis de desempenho
      rubric.performance_levels.forEach((level, index) => {
        rubricHTML += `
          <th style="padding: 10px; text-align: center;">
            ${level.name}<br>${level.value} pontos
          </th>
        `;
      });
    
      rubricHTML += `
            </tr>
          </thead>
          <tbody>
      `;
    
      // Linhas com os critérios e descritores
      rubric.criteria.forEach((criterion, cIndex) => {
        rubricHTML += `
          <tr>
            <td style="padding: 10px; background-color: #faddc2; font-weight: bold;">
              ${criterion.name}
            </td>
        `;
    
        // Células com os descritores
        criterion.descriptors.forEach((descriptor, dIndex) => {
          const isSelected = selectedLevels[cIndex] === dIndex;
          rubricHTML += `
            <td style="padding: 10px; text-align: center; border: 1px solid #ddd; ${
              isSelected ? "background-color: #e0f7e0;" : ""
            }">
              ${descriptor}
            </td>
          `;
        });
    
        rubricHTML += `
          </tr>
        `;
      });
    
      rubricHTML += `
          </tbody>
        </table>
      `;
    
      return rubricHTML;
    }

    // Criar os e-mails
    const emailPromises = evaluation.evaluation_result.map(async (result: any) => {
      const student = students.find((s: { id: any; }) => s.id === result.student_id);
      if (!student) return null;

      const rubric = await fetchRubric(evaluation.rubric_model_id);
      if (!rubric) {
        console.error("Rubrica não encontrada para o ID:", evaluation.rubric_model_id);
        return null;
      }

      // Gerar o HTML do e-mail
      const emailHTML = `
      <div style="font-family: Arial, sans-serif; max-width: 750px; margin: 0 auto;">
        <h2 style="text-align: center; color: #af5909; margin-bottom: 20px;">
          Resultado da Avaliação: ${evaluation.evaluation_name}
        </h2>
        <p>
          Olá ${student.nome} ${student.sobrenome},
        </p>
        <p>
          Segue o resultado da sua avaliação:
        </p>
        <ul>
          <li><strong>Professor Avaliador:</strong> Prof. Fulano</li>
          <li><strong>Nota Total:</strong> ${result.score}</li>
          <li><strong>Comentário do Professor:</strong> ${result.evaluation_comment || "Nenhum comentário fornecido."}</li>
        </ul>
        <p>
          Logo abaixo você verá a rubrica utilizada em sua avaliação, os campos com fundo verde indicam o nível de desempenho selecionado pelo avaliador.
        </p>
        <p>
         Caso você queira abrir um recurso, entre em contato com o professor responsável ou utilize este token de acesso único direto no nosso sistema: link
        </p>

        <h3 style="color: #af5909; margin-top: 30px; margin-bottom: 10px;">
          Detalhes da Rubrica:
        </h3>
        ${generateRubricHTML(rubric, result.rubric_evaluation)}

        <p>
          <strong> Nota: </strong> <i> Este é um email automático, por favor não responda! </i>
        </p>
      </div>
    `;

      const mailOptions = {
        from: import.meta.env.VITE_RUBRIC_PRO_EMAIL,
        to: student.email,
        subject: `Resultado Avaliação ${evaluation.evaluation_name}`,
        html: emailHTML, // Usar o HTML gerado
      };

        return transporter.sendMail(mailOptions);
      });

    // Enviar todos os e-mails simultaneamente
    await Promise.all(emailPromises.filter((p: any) => p !== null));

    return json({ message: "Notificações enviadas com sucesso!" });
  } catch (error) {
    console.error("Erro ao enviar notificações:", error);
    return json({ error: "Erro interno ao enviar notificações" }, { status: 500 });
  }
}

