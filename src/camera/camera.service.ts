import { Injectable, Logger } from '@nestjs/common';
import { Recorder } from 'node-rtsp-recorder';
import { config } from 'process';
import { Cron, CronExpression, SchedulerRegistry } from '@nestjs/schedule';
import * as data from './data.json';
interface Configs {
  url: string;
  id: string;
  //rate: number;
  path: string;
  name: string;
}

interface Recorder {
  recorder: any;
  id: string;
}

@Injectable()
export class CameraService {
  private recorder: Recorder[];

  private logger = new Logger('CAMERA_SERVICE');
  private job;
  constructor(private schedulerRegistry: SchedulerRegistry) {
    this.initRecorder(data);
    this.job = this.schedulerRegistry.getCronJob('recorder');
    this.job.start();
  }

  initRecorder(configs: Configs[]) {
    for (let i = 0; i < configs.length; i++) {
      const rec = new Recorder({
        url: configs[i].url,
        folder: '',
        name: configs[i].name,
        type: 'image',
      });
      this.recorder.push({
        recorder: rec,
        id: configs[i].id,
        //rate:configs[i].rate;
      });
    }
  }

  @Cron(CronExpression.EVERY_30_SECONDS, {
    name: 'recorder',
  })
  captureProcess() {
    this.recorder.map((recItem) => {
      recItem.recorder.captureImage(() => {
        this.logger.log('[d] image captured !');
      });
    });
  }
}
