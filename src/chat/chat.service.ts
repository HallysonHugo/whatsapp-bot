import { Injectable } from '@nestjs/common';
import { CreateChatDto } from './dto/create-chat.dto';
import { UpdateChatDto } from './dto/update-chat.dto';
import { LlmService } from 'src/llm/llm.service';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { ChatModel } from './schema/chat.schema';
import { ChatCompletionMessageParam } from 'openai/resources';
import { ServicesModel } from 'src/services/schema/services.schema';

@Injectable()
export class ChatService {
  constructor(
    private readonly llmService: LlmService,
    @InjectModel('Chat') private chatSchema: Model<ChatModel>,
    @InjectModel('Services')
    private servicesSchema: Model<ServicesModel>,
  ) {}
  normalizePhoneNumber(phone: string) {
    if (phone.startsWith('55') && phone.length === 12) {
      return phone.slice(0, 4) + '9' + phone.slice(4);
    }
    return phone;
  }

  async getUserHistory(phone: string) {
    const user = await this.chatSchema.find({ user_id: phone });
    return user;
  }

  async analyseQuestionAndGetData(question: string) {
    const analyseQuestion = await this.llmService.analyseText(question);

    const results: {
      data?: any;
      horario?: any;
      localizacao?: string;
      servico?: any;
    } = {};

    // const promises: Promise<any>[] = [];

    if (analyseQuestion.data) {
      // Buscar datas disponíveis
    }

    if (analyseQuestion.horario) {
      results.horario = '14:30';
    }

    if (analyseQuestion.localizacao) {
      results.localizacao = 'Avenida Paulista, São Paulo';
    }

    if (analyseQuestion.servico) {
      results.servico = await this.servicesSchema.find().lean();
    }
    return results;
  }

  async answerQuestionGpt(question: string, phone: string, type: string) {
    const userHistory = await this.getUserHistory(phone);
    await this.chatSchema.create({
      content: question,
      user_id: phone,
      role: 'user',
    });
    const messages: ChatCompletionMessageParam[] = userHistory.map(
      (message) => {
        return {
          role: message.role,
          content: message.content,
        } as ChatCompletionMessageParam;
      },
    );
    const injectInformation = await this.analyseQuestionAndGetData(question);
    const response = await this.llmService.botAnswer(
      question,
      messages,
      JSON.stringify(injectInformation),
    );
    if (!response) return;
    await this.chatSchema.create({
      content: response,
      user_id: phone,
      role: 'assistant',
    });
    console.log(JSON.stringify(response));
    await this.sendMessage(response, phone, type);
  }

  async answerQuestionRasa(question: string, phone: string, type: string) {
    try {
      const userHistory = await this.getUserHistory(phone);
      const response = await this.llmService.botResponseRasa(question);
      if (!response) return;
      await this.chatSchema.create({
        content: response,
        user_id: phone,
        role: 'assistant',
      });
      console.log(JSON.stringify(response));
      await this.sendMessage(response, phone, type);
    } catch (e) {
      console.log(e);
    }
  }

  async sendMessage(message: string, phone: string, type: string) {
    try {
      if (phone) phone = this.normalizePhoneNumber(phone);
      const result = await fetch(
        'https://graph.facebook.com/v21.0/565761429957409/messages',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${process.env.ACCESS_TOKEN}`,
          },
          body: JSON.stringify({
            messaging_product: 'whatsapp',
            to: phone || '5569993919346',
            type: type || 'text',
            text: {
              body: message,
            },
            // "template": { "name": "hello_world", "language": { "code": "en_US" } }
          }),
        },
      );
      return await result.json();
    } catch (e) {
      console.log(e);
    }
  }
}
