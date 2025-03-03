import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { HydratedDocument, Types } from "mongoose";

export type ChatDocument = HydratedDocument<ChatModel>;

@Schema({ timestamps: true })
export class ChatModel {

    @Prop({ required: true })
    content: string;

    @Prop({ required: true })
    user_id: string;

    @Prop({ required: true })
    role: string;

    @Prop()
    user_name: string;


}

export const ChatSchema = SchemaFactory.createForClass(ChatModel);