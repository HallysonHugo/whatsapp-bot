import { Module } from '@nestjs/common';
import { LlmService } from './llm.service';
import { OpenaiModule } from './openai/openai.module';

@Module({
  imports: [OpenaiModule],
  providers: [LlmService],
  exports: [LlmService]
})
export class LlmModule { }
