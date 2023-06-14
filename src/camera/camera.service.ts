import { Injectable, Logger } from '@nestjs/common';
import { Recorder } from 'node-rtsp-recorder';
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

  constructor() {
    this.initRecorder();
  }

  initRecorder() {
    console.log('init Recorder');
    for (let i = 0; i < data.length; i++) {
      const rec = new Recorder({
        url: data[i].url,
        folder: process.env.IMAGES_PATH,
        type: 'image',
      });
      this.recorder.push({
        recorder: rec,
        id: data[i].ip,
      });
    }
  }
  // onImage(filename) {
  //   console.log(filename);
  // }
  captureProcess() {
    this.recorder.map((recItem) => {
      const filename = recItem.recorder.captureImage(() => {
        this.logger.log('image saved to ', recItem.recorder.folder);
        this.PostRealTime(new Date());
      });
      console.log(filename);
    });
  }

  PostRealTime(date: Date) {
    console.log(date);
  }
}
