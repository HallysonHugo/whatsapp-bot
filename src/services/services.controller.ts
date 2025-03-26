import { Body, Controller, Get, Post, Put } from '@nestjs/common';
import { ServicesService } from './services.service';
import { Types } from 'mongoose';

@Controller('services')
export class ServicesController {
  constructor(private readonly servicesService: ServicesService) {}

  @Get('/get')
  getServices(){
    console.log('get-services')
    return this.servicesService.getServices();
  }

  @Post('/create')
  createServices(@Body() body: {name: string, description: string, value: number}){
    return this.servicesService.createService({description: body.description, title: body.name, value: body.value});
  }

  @Put("/update/:id")
  updateService(@Body() body: {id:string, name: string, description: string, value: number}){
    return this.servicesService.updateService(body.id, {description: body.description, title: body.name, value: body.value});
  }
}
