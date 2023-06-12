
import { Injectable, Logger } from '@nestjs/common';
import { Recorder } from 'node-rtsp-recorder';
import { Cron, CronExpression, SchedulerRegistry } from '@nestjs/schedule';
import * as data from './data.json';
import { exec, execSync } from 'child_process';



interface Recorder {
  recorder: any;
  id: string;
}

@Injectable()
export class CameraService {
  private recorder: Recorder[] = [];
  public date = new Date();
  private logger = new Logger('CAMERA_SERVICE');
  private path = '';
  
  
  constructor(private schedulerRegistry: SchedulerRegistry) {
    this.changePath()
    this.initRecorder();
  }
 

  changePath() {
    this.date = new Date();
    this.path= this.date.getMinutes().toString();
    console.log(`Path: ${this.path}`);
  }
  @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
  initRecorder() {
    console.log('init')
    this.changePath()
    this.recorder.length=0;
    for (let i = 0; i < data.length; i++) {
      const rec = new Recorder({
        url: data[i].url,
        folder : '/home/nextronic/data',
        camera : data[i].camera,
        year: this.date.getFullYear().toString(),
        month: (this.date.getMonth() + 1).toString(),
        day: this.date.getDate().toString(),
        // day : this.date.getMinutes().toString(),
        type: 'image',
      });
      // this.logger.log("rec",rec.folder);
      this.recorder.push({
        recorder: rec,
        id: data[i].id,
      })
    }
  }

  @Cron('*/1 * * * *') 
  captureProcess() {  
    this.recorder.map((recItem) => {
      let  storage = execSync(`df -h ${recItem.recorder.folder} | awk 'NR==2 {print $4}'`).toString();
      // storage = '55k'
      console.log(storage)
      const typeKB = storage.includes('K');
      const sizeValue = +storage.replace(/[GMK]/gi, '');

      console.log('typeKB', typeKB ,'sizeValue', sizeValue )
      // stop the record when the sizze is less than 150KB
      if(!(typeKB && sizeValue<150)){
        recItem.recorder.captureImage(() => {
         this.logger.log('image saved to ', recItem.recorder.folder)
        });
      }
      else{
        this.logger.log("stop Saving memory ")
      }
    });
  }
}
