import { Injectable } from '@nestjs/common';
import { OpenaiService } from './openai/openai.service';
import { ChatCompletionMessageParam } from 'openai/resources';

@Injectable()
export class LlmService {
    constructor(private readonly openaiService: OpenaiService) { }

    async botAnswer(question: string, messages: ChatCompletionMessageParam[]) {
        return await this.openaiService.botAnswer(question, messages);
    }

}
