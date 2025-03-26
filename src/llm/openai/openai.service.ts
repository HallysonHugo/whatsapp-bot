import { Injectable } from '@nestjs/common';
import OpenAI from 'openai';
import { ChatCompletionMessageParam } from 'openai/resources';

@Injectable()
export class OpenaiService {

    private readonly _openAi = new OpenAI({
        apiKey: process.env.OPENAI_KEY,
    })

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




    async botAnswer(question: string, messages: ChatCompletionMessageParam[], prompt: string) {
        const result = await this._openAi.chat.completions.create({
            model: 'gpt-3.5-turbo',
            messages: [
                {
                    role: 'system',
                    content: prompt,
                },
                ...messages,
                {
                    role: 'user',
                    content: question,
                },
            ],
            max_completion_tokens: 150,
            temperature: 0.7,
            stop: ['\n'],
        });
        // this._chatHistory += question + '\n' + result.choices[0].message.content + '\n';
        return result.choices[0].message.content;
    }



    async botAnalyse(question: string, prompt: string) {
        const result = await this._openAi.chat.completions.create({
            model: 'gpt-3.5-turbo',
            messages: [
                {
                    role: 'system',
                    content: prompt,
                },
                {
                    role: 'user',
                    content: question,
                },
            ],
            max_completion_tokens: 150,
            temperature: 0.7,
            stop: ['\n'],
        });
        return result.choices[0].message.content;
    }
}

