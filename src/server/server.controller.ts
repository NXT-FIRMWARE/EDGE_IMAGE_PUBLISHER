import { Controller, Get, Post, Body } from '@nestjs/common';
import { ServerService } from './server.service';


@Controller('server')
export class ServerController {
  constructor(private readonly serverService: ServerService) {}

  @Post()
  create(@Body() image) {
    return this.serverService.create(image);
  }

  

 

 

  

 
}
