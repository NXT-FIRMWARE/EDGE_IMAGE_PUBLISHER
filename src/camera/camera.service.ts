
import { Injectable, Logger } from '@nestjs/common';
import { Recorder } from 'node-rtsp-recorder';
import { Cron, CronExpression, SchedulerRegistry } from '@nestjs/schedule';
// import * as data from './data.json';
import {  execSync } from 'child_process';
import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()


interface Recorder {
  recorder: any;
  id: string;
}

@Injectable()
export class CameraService {
  private recorder: Recorder[] = [];
  public date = new Date();
  private logger = new Logger('CAMERA_SERVICE');
  private connected_Cameras =[]
  
  constructor(private schedulerRegistry: SchedulerRegistry) {
    this.initRecorder();
  }
 
  async connectedCameras(){
    this.connected_Cameras.length=0
    const cameras = await prisma.camera.findMany()
    console.log('cameras', cameras)
     cameras.map( camera =>{
      try {
        execSync(`sudo ping -c 5 ${camera.ip}`).toString();
        console.log(`ping  success  to ${camera.ip}`)
        this.connected_Cameras.push(camera);
      } catch (error) {
        console.log(`ping not success  to ${camera.ip}`)
      }
    })

  }


  @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
  async initRecorder() {
    console.log('init Recorder')
    this.recorder.length=0;
    await  this.connectedCameras()
    for (let i = 0; i < this.connected_Cameras.length; i++) {
      const rec = new Recorder({
        url: this.connected_Cameras[i].url,
        folder :process.env.IMAGES_PATH,
        camera : this.connected_Cameras[i].cameraName,
        year: this.date.getFullYear().toString(),
        month: (this.date.getMonth() + 1).toString(),
        day: this.date.getDate().toString(),
        // day : this.date.getMinutes().toString(),
        type: 'image',
      });
      this.recorder.push({
        recorder: rec,
        id: this.connected_Cameras[i].ip,
      })
    }
  }

  @Cron('*/1 * * * *') 
  captureProcess() {  
    this.recorder.map((recItem) => {
      const  storage = execSync(`df -h ${recItem.recorder.folder} | awk 'NR==2 {print $4}'`).toString();
      const typeKB = storage.includes('K');
      const sizeValue = +storage.replace(/[GMK]/gi, '');
      if(!(typeKB && sizeValue<150)){
        recItem.recorder.captureImage(() => {
         this.logger.log('image saved to ', recItem.recorder.folder)
        });
      }
      else{
        this.logger.log("stop Saving in memory ")
      }
    });
  }
}

