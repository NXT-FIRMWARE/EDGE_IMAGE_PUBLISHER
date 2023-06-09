
import { Injectable, Logger } from '@nestjs/common';
import { Recorder } from 'node-rtsp-recorder';
import { Cron, CronExpression, SchedulerRegistry } from '@nestjs/schedule';
import * as data from './data.json';



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
  @Cron(CronExpression.EVERY_MINUTE)
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
      this.logger.log("rec",rec.folder);
      this.recorder.push({
        recorder: rec,
        id: data[i].id,
      })
    }
  }

  @Cron(CronExpression.EVERY_5_SECONDS) 
  captureProcess() {   
    this.recorder.map((recItem) => {
      recItem.recorder.captureImage(() => {
        console.log('image saved to ', recItem.recorder.folder)
      });
    });
  }
}
