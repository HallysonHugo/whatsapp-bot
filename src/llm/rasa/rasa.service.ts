import { Injectable } from '@nestjs/common';
import { CreateRasaDto } from './dto/create-rasa.dto';
import { UpdateRasaDto } from './dto/update-rasa.dto';

@Injectable()
export class RasaService {


  async botResponseRasa(question: string) {
    const analyse = await fetch('http://localhost:8000/bot-response', {
      method: 'POST',
      body: JSON.stringify({ message: question, sender: "user" }),
      headers: {
        'Content-Type': 'application/json',
      },
    });
    const result = await analyse.json()
    const messages = result.map((value)=> value.text || value.image)
    return messages.join('\n')
  }
}
