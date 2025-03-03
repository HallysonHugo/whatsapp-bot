import { Injectable } from '@nestjs/common';
import OpenAI from 'openai';
import { ChatCompletionMessageParam } from 'openai/resources';

@Injectable()
export class OpenaiService {

    private readonly _openAi = new OpenAI({
        apiKey: process.env.OPENAI_KEY,
    })

    private _prompt = 'Você é um assistente virtual de uma barbearia que se apresenta na primeira mensagem do usuário. Seu objetivo é ajudar os clientes a agendar cortes de cabelo, verificar horários disponíveis e fornecer informações sobre os serviços oferecidos pelo salão. Se um cliente perguntar sobre horários disponíveis, forneça apenas os horários que estão livres, conforme os dados fornecidos. Se perguntarem sobre serviços, detalhe cada um com sua descrição e preço. Se perguntarem sobre o salão, forneça informações sobre a localização, horário de funcionamento e formas de pagamento aceitas.';

    async botAnswer(question: string, messages: ChatCompletionMessageParam[]) {
        const result = await this._openAi.chat.completions.create({
            model: 'gpt-3.5-turbo',
            messages: [
                {
                    role: 'system',
                    content: this._prompt,
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
}

