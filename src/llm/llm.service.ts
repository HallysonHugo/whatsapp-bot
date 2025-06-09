import { Injectable } from '@nestjs/common';
import { OpenaiService } from './openai/openai.service';
import { ChatCompletionMessageParam } from 'openai/resources';
import { RasaService } from './rasa/rasa.service';
import { ServicesModel } from 'src/services/schema/services.schema';

@Injectable()
export class LlmService {
  constructor(
    private readonly openaiService: OpenaiService,
    private readonly rasaService: RasaService,
  ) {}

  private _prompt: string = `Você é um assistente virtual de uma barbearia que se apresenta na primeira mensagem do usuário. 
    Seu objetivo é ajudar os clientes a agendar cortes de cabelo, verificar horários disponíveis e fornecer informações sobre os serviços oferecidos pelo salão. 
    Se um cliente perguntar sobre horários disponíveis, forneça apenas os horários que estão livres, conforme os dados fornecidos. 
    Se perguntarem sobre serviços, detalhe cada um com sua descrição e preço. 
    Se perguntarem sobre o salão, forneça informações sobre a localização, horário de funcionamento e formas de pagamento aceitas.`;

  private _promptAnalyse: string = `
    Seu objetivo é analisar a mensagem do usuário e identificar se ele está mencionando ou perguntando sobre uma data, um horário, um serviço ou uma localização. 
    Retorne a resposta no formato JSON, sem explicações adicionais. Exemplos de resposta:

    - Se o usuário mencionar uma data: {"data": "10/10/2022"}
    - Se o usuário perguntar sobre datas disponíveis: {"data": "pergunta"}
    - Se o usuário perguntar sobre datas para confirmar um agendamento: {"data": "pergunta para confirmar"}
    - Se o usuário perguntar sobre alteras datas disponíveis: {"data": "alterar"}
    - Se o usuário confirmar o agendamento: {"data": "cancelar"}
    - Se o usuário mencionar um horário: {"horario": "14:30"}
    - Se o usuário confirmar um horário: {"horario": "confirmar"}
    - Se o usuário quiser alterar um horário: {"horario": "alterar"}
    - Se o usuário perguntar sobre horários disponíveis: {"horario": "pergunta"}
    - Se o usuário mencionar um serviço: {"servico": "corte de cabelo"}
    - Se o usuário perguntar sobre serviços disponíveis: {"servico": "pergunta"}
    - Se o usuário mencionar uma localização: {"localizacao": "Avenida Paulista, São Paulo"}
    - Se o usuário mencionar múltiplas informações: {"data": "10/10/2022", "horario": "14:30", "servico": "corte de cabelo"}

    Se nenhuma dessas informações for identificada, retorne um JSON vazio: {}.
    `;

  async analyseText(question: string) {
    const typeOfQuestion = await this.openaiService.botAnalyse(
      question,
      this._promptAnalyse,
    );
    // check if typeOfQuestion is a valid JSON string
    if (!typeOfQuestion || typeof typeOfQuestion !== 'string') {
      console.error('Resposta inválida do OpenAI:', typeOfQuestion);
      return {};
    }
    return this.extractData(typeOfQuestion ?? '');
  }

  async botResponseRasa(question: string) {
    const analyse = await this.rasaService.botResponseRasa(question);
    return analyse;
  }

  async botAnswer(
    question: string,
    messages: ChatCompletionMessageParam[],
    continue_prompt: string,
  ) {
    const formattedPrompt = this.formatToPrompt(
      this.extractData(continue_prompt),
    );
    return await this.openaiService.botAnswer(
      question,
      messages,
      formattedPrompt,
    );
  }

  extractData(respostaBot: string): {
    data?: string[];
    horario?: string[];
    servico?: string[];
    localizacao?: string;
  } {
    try {
      const dados = JSON.parse(respostaBot);

      return {
        ...(dados.data
          ? { data: Array.isArray(dados.data) ? dados.data : [dados.data] }
          : {}),
        ...(dados.horario
          ? {
              horario: Array.isArray(dados.horario)
                ? dados.horario
                : [dados.horario],
            }
          : {}),
        ...(dados.servico
          ? {
              servico: Array.isArray(dados.servico)
                ? dados.servico
                : [dados.servico],
            }
          : {}),
        ...(dados.localizacao ? { localizacao: dados.localizacao } : {}),
      };
    } catch (error) {
      console.error('Erro ao analisar a resposta do bot:', error);
      return {};
    }
  }

  formatToPrompt(extractedData: {
    data?: any[];
    horario?: any[];
    servico?: any[];
    localizacao?: string;
  }): string {
    let extractedInfo = '';

    if (extractedData.data?.length) {
      extractedInfo = `📅 Datas disponíveis: ${extractedData.data.join(', ')}`;
    }
    if (extractedData.horario?.length) {
      extractedInfo += `\n⏰ Horários disponíveis: ${extractedData.horario.join(', ')}`;
    }
    if (extractedData.servico?.length) {
      const servicos = extractedData.servico.map((s) => {
        return `${s.title} - ${s.description} (R$ ${s.value})`;
      });
      extractedInfo += `\n💈 Serviços disponíveis: ${servicos.join(', ')}`;
    }
    if (extractedData.localizacao) {
      extractedInfo += `\n📍 Localização: ${extractedData.localizacao}`;
    }
    // Remove espaços extras e quebras de linha desnecessárias
    extractedInfo = extractedInfo.replace(/\n\s*\n/g, '\n').trim();
    // Formata o prompt final com as informações extraídas
    return `
${this._prompt}
${extractedInfo ? `\nAqui estão algumas informações relevantes antes de responder:\n${extractedInfo}` : ''}
        `.trim();
  }
}
