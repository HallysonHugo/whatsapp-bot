import { Injectable } from '@nestjs/common';
import { CreateChatDto } from './dto/create-chat.dto';
import { UpdateChatDto } from './dto/update-chat.dto';
import { LlmService } from 'src/llm/llm.service';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { ChatModel } from './schema/chat.schema';
import { ChatCompletionMessageParam } from 'openai/resources';

@Injectable()
export class ChatService {

  constructor(private readonly llmService: LlmService, @InjectModel('Chat') private chatSchema: Model<ChatModel>) { }
  create(createChatDto: CreateChatDto) {
    return 'This action adds a new chat';
  }

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


  async answerQuestion(question: string, phone: string, type: string) {
    const userHistory = await this.getUserHistory(phone);
    await this.chatSchema.create({ content: question, user_id: phone, role: 'user' });
    const messages: ChatCompletionMessageParam[] = userHistory.map((message) => {
      return {
        role: message.role,
        content: message.content
      } as ChatCompletionMessageParam
    });
    const response = await this.llmService.botAnswer(question, messages);
    if (!response) return;
    await this.chatSchema.create({ content: response, user_id: phone, role: 'assistant' });
    await this.sendMessage(response, phone, type);
  }


  async sendMessage(message: string, phone: string, type: string) {
    try {
      if (phone) phone = this.normalizePhoneNumber(phone);
      const result = await fetch('https://graph.facebook.com/v21.0/565761429957409/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.TOKEN}`
        },
        body: JSON.stringify({
          "messaging_product": "whatsapp",
          "to": phone || "5569993919346",
          "type": type || "text",
          "text": {
            "body": message
          }
          // "template": { "name": "hello_world", "language": { "code": "en_US" } }
        })
      });
      return await result.json();
    }
    catch (e) {
      console.log(e)
    }
  }

  findAll() {
    return `This action returns all chat`;
  }

  findOne(id: number) {
    return `This action returns a #${id} chat`;
  }

  update(id: number, updateChatDto: UpdateChatDto) {
    return `This action updates a #${id} chat`;
  }

  remove(id: number) {
    return `This action removes a #${id} chat`;
  }
}
