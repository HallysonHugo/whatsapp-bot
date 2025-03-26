import { Module } from '@nestjs/common';
import { LlmService } from './llm.service';
import { OpenaiModule } from './openai/openai.module';
import { RasaModule } from './rasa/rasa.module';

@Module({
  imports: [OpenaiModule, RasaModule],
  providers: [LlmService],
  exports: [LlmService]
})
export class LlmModule { }
