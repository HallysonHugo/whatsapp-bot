import { Injectable } from '@nestjs/common';
import { CreateRasaDto } from './dto/create-rasa.dto';
import { UpdateRasaDto } from './dto/update-rasa.dto';

@Injectable()
export class RasaService {


  private fast_api_url = 'http://localhost:8000/bot-response';
  private rasa_webhook_url = 'http://localhost:5005/webhooks/rest/webhook';

  async botResponseRasa(question: string) {
    const analyse = await fetch(this.rasa_webhook_url, {
      method: 'POST',
      body: JSON.stringify({ message: question, sender: "user" }),
      headers: {
        'Content-Type': 'application/json',
      },
    });
    const result = await analyse.json()
    const messages = result.map((value) => value.text || value.image)
    return messages.join('\n')
  }
}
