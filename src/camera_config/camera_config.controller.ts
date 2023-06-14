import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { CameraConfigService } from './camera_config.service';
import { CameraService } from 'src/camera/camera.service';
import { CameraDto } from './camera_config.dto';

@Controller('camera-config')
export class CameraConfigController {
  constructor(private readonly cameraConfigService: CameraConfigService , private  CameraService :CameraService) {}

  @Post()
  async create(@Body() CameraDto: CameraDto) {
    const addCamera = await this.cameraConfigService.create(CameraDto);
    console.log(addCamera)
    this.CameraService.addCamera(CameraDto.ip)
    return addCamera
  }

  @Get()
  findAll() {
    return this.cameraConfigService.findAll();
  }


  @Patch(':id')
  async update(@Param('id') ip: string, @Body() CameraDto: CameraDto ) {
    const updateCamera = await this.cameraConfigService.update(ip, CameraDto);
    if(updateCamera === "camera added succesfuly") this.CameraService.initRecorder()
    return updateCamera
  }

  @Delete(':id')
  async remove(@Param('id') ip: string) {
    const deleteCamera = await  this.cameraConfigService.remove(ip);
    console.log('deleteCamera', deleteCamera)
    if(deleteCamera === "deleted succesufuly") this.CameraService.initRecorder()
    return deleteCamera
  }
}
