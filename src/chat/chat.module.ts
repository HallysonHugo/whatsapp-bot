import { Module } from '@nestjs/common';
import { ChatService } from './chat.service';
import { ChatController } from './chat.controller';
import { LlmModule } from 'src/llm/llm.module';
import { MongooseModule } from '@nestjs/mongoose';
import { ChatSchema } from './schema/chat.schema';

@Module({
  imports: [LlmModule, MongooseModule.forFeature([{ name: 'Chat', schema: ChatSchema }])],
  controllers: [ChatController],
  providers: [ChatService],
})
export class ChatModule { }
