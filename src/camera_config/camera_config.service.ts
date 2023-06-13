import { Injectable } from '@nestjs/common';
import { CameraDto } from './camera_config.dto';
import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()

@Injectable()
export class CameraConfigService {
  async create(CameraDto: CameraDto) {
    try {
      await prisma.camera.create({
        data: {
          url: CameraDto.url,
          ip: CameraDto.ip,
          cameraName: CameraDto.cameraName,
        },
      })

      return "added successufuly";
    } catch (error) {
      return error;
    }   
  }

  async findAll() {
    const cameras = await prisma.camera.findMany()
    return cameras;
  }

async update(ip: string, CameraDto ) {
    try {
      await prisma.camera.update({
        where: {
          ip: ip,
        },
        data: {
          url: CameraDto.url,
          cameraName: CameraDto.cameraName,
        },
      })
      return "updated succesufuly"
    } catch (error) {
      return `updated error ${error}`
    }    
  }

async remove(ip: string) {
    try {
      await prisma.camera.delete({
        where: {
          ip: ip,
        }
      })
      return "deleted succesufuly"
    } catch (error) {
      return `delete error ${error}`
    }  
  }
}
