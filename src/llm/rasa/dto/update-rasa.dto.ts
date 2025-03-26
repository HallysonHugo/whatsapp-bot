import { PartialType } from '@nestjs/mapped-types';
import { CreateRasaDto } from './create-rasa.dto';

export class UpdateRasaDto extends PartialType(CreateRasaDto) {}
