import { Controller, Get, Post, Body, Patch, Param, Delete, Req, HttpCode } from '@nestjs/common';
import { ChatService } from './chat.service';
import { CreateChatDto } from './dto/create-chat.dto';
import { UpdateChatDto } from './dto/update-chat.dto';

@Controller('')
export class ChatController {
  constructor(private readonly chatService: ChatService) { }

  @Post()
  create(@Body() createChatDto: CreateChatDto) {
    return this.chatService.create(createChatDto);
  }

  @Post('send')
  async sendMessage(@Body() body: { message: string, to: string, type: string }) {
    return await this.chatService.sendMessage(body.message, body.to, body.type);
  }

  @Get('webhook')
  async whatsAppVerificationChallenge(@Req() req: any) {
    console.log('webhook')
    const mode = req.query['hub.mode'];
    const verify_token = req.query['hub.verify_token'];
    const challenge = req.query['hub.challenge'];

    if (!mode && !verify_token) {
      return 'Error verifying token';
    }
    if (mode === 'subscribe' && verify_token === process.env.WEBHOOK_TOKEN) {
      return challenge;
    }
  }

  @Post('webhook')
  @HttpCode(200)
  async handleIncomingMessage(@Body() body: any) {
    console.log('working')
    const messages = body?.entry?.[0]?.changes?.[0].value
    if (!messages) return;
    const message = messages.messages?.[0];
    const sender = messages?.contacts?.[0].wa_id;
    if (!sender) return;
    console.log(message.text.body)
    switch (message.type) {
      case 'text':
        // this.chatService.answerQuestionGpt(message.text.body, sender, 'text');
        this.chatService.answerQuestionRasa(message.text.body, sender, 'text');
        return { status: 'success' };
      default:
        return this.chatService.sendMessage(`Tipo de mensagem não suportada ainda`, sender, 'text');
    }
  }

  @Get()
  findAll() {
    return this.chatService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.chatService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateChatDto: UpdateChatDto) {
    return this.chatService.update(+id, updateChatDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.chatService.remove(+id);
  }
}
