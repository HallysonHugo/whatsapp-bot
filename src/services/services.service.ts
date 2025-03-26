import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { ServicesModel } from './schema/services.schema';

@Injectable()
export class ServicesService {
  constructor(@InjectModel('Services') private readonly servicesModel: Model<ServicesModel>) {}

  async getServices(){
    return this.servicesModel.find().exec();
  }

  async serviceById(id: string){
    return this.servicesModel.findById(new Types.ObjectId(id)).exec();
  }

  async createService(service: ServicesModel){
    const newService = new this.servicesModel(service);
    return newService.save();
  }

  async updateService(id: string, service: ServicesModel){
    return this.servicesModel.updateOne({ _id: new Types.ObjectId(id) }, service);
  }
}
