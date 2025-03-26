import { Injectable } from '@nestjs/common';
import { OpenaiService } from './openai/openai.service';
import { ChatCompletionMessageParam } from 'openai/resources';
import { RasaService } from './rasa/rasa.service';

@Injectable()
export class LlmService {
    constructor(
      private readonly openaiService: OpenaiService,
      private readonly rasaService: RasaService
    ) { }


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
    - Se o usuário mencionar um horário: {"horario": "14:30"}
    - Se o usuário perguntar sobre horários disponíveis: {"horario": "pergunta"}
    - Se o usuário mencionar um serviço: {"servico": "corte de cabelo"}
    - Se o usuário perguntar sobre serviços disponíveis: {"servico": "pergunta"}
    - Se o usuário mencionar uma localização: {"localizacao": "Avenida Paulista, São Paulo"}
    - Se o usuário mencionar múltiplas informações: {"data": "10/10/2022", "horario": "14:30", "servico": "corte de cabelo"}

    Se nenhuma dessas informações for identificada, retorne um JSON vazio: {}.
    `;

    async analyseText(question: string) {
        const typeOfQuestion = await this.openaiService.botAnalyse(question, this._promptAnalyse);
        return this.extractData(typeOfQuestion ?? "");
    }


    async botResponseRasa(question: string) {
        const analyse = await this.rasaService.botResponseRasa(question);
        return analyse;
    }

    async botAnswer(question: string, messages: ChatCompletionMessageParam[], continue_prompt: string) {
        // Obtém os dados analisados
        const extractedData = await this.analyseText(question);

        // Formata as informações extraídas
        const formattedPrompt = this.formatToPrompt(extractedData);

        // Faz a requisição ao OpenAI com as informações adicionais
        return await this.openaiService.botAnswer(question, messages, formattedPrompt);
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
                ...(dados.data ? { data: Array.isArray(dados.data) ? dados.data : [dados.data] } : {}),
                ...(dados.horario ? { horario: Array.isArray(dados.horario) ? dados.horario : [dados.horario] } : {}),
                ...(dados.servico ? { servico: Array.isArray(dados.servico) ? dados.servico : [dados.servico] } : {}),
                ...(dados.localizacao ? { localizacao: dados.localizacao } : {}),
            };
        } catch (error) {
            console.error("Erro ao analisar a resposta do bot:", error);
            return {};
        }
    }

    formatToPrompt(
        extractedData: { data?: string[]; horario?: string[]; servico?: string[]; localizacao?: string },
    ): string {
        const extractedInfo = `
${extractedData.data?.length ? `📅 Datas disponíveis: ${extractedData.data.join(", ")}` : ""}
${extractedData.horario?.length ? `⏰ Horários disponíveis: ${extractedData.horario.join(", ")}` : ""}
${extractedData.servico?.length ? `💈 Serviços disponíveis: ${extractedData.servico.join(", ")}` : ""}
${extractedData.localizacao ? `📍 Localização: ${extractedData.localizacao}` : ""}
        `.trim(); // Remove espaços extras

        return `
${this._prompt}
${extractedInfo ? `\nAqui estão algumas informações relevantes antes de responder:\n${extractedInfo}` : ""}
        `.trim();
    }
}