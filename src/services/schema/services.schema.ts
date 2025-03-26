import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';

export type ServicesDocument = HydratedDocument<ServicesModel>

@Schema()
export class ServicesModel{

  @Prop({default: ()=> new Types.ObjectId(), type: Types.ObjectId})
  _id?: Types.ObjectId

  @Prop()
  title: string;

  @Prop()
  description: string;

  @Prop()
  value: number;

}


export const ServicesSchema = SchemaFactory.createForClass(ServicesModel);