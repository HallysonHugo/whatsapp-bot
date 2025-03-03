import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ChatModule } from './chat/chat.module';
import { ConfigModule } from '@nestjs/config';
import { LlmModule } from './llm/llm.module';
import { MongooseModule } from '@nestjs/mongoose';

@Module({
  imports: [
    ConfigModule.forRoot(),
    MongooseModule.forRoot(`mongodb+srv://${process.env.MONGO_USER}:${process.env.MONGO_PASSWORD}@bot.jaidp.mongodb.net/?retryWrites=true&w=majority&appName=bot`),
    ChatModule,
    LlmModule
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule { }
