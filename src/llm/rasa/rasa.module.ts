import { Module } from '@nestjs/common';
import { RasaService } from './rasa.service';

@Module({
  providers: [RasaService],
  exports: [RasaService]
})
export class RasaModule { }
