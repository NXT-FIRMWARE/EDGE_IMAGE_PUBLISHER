import { Injectable, Logger } from '@nestjs/common';
import { Recorder } from 'node-rtsp-recorder';
import * as data from './data.json';
import * as FormData from 'form-data';
import * as fs from 'fs';
import axios from 'axios';
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
    // this.initRecorder();
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
  async captureProcess() {
    //await this.recorder.map(async (recItem) => {
    for (let i = 0; i < this.recorder.length; i++) {
      await this.recorder[i].recorder.captureImage((filename) => {
        this.logger.log('image saved to ', this.recorder[i].recorder.folder);
        console.log(filename);
        //post request
        this.PostRealTime();
      });
    }
  }

  async PostRealTime() {
    const filename = 'C:/Users/jbray/Desktop/hello.png';
    const data = new FormData();
    const image = fs.createReadStream(filename);
    data.append('image', image);
    data.append('time', new Date().toLocaleString());
    data.append('location', process.env.LOCATION);
    data.append('cameraName', 'DOME1');
    await axios
      .post('http://192.168.1.29:3001/server', data, {
        headers: {
          accept: 'application/json',
          'Accept-Language': 'en-US,en;q=0.8',
          'Content-Type': 'multipart/form-data',
        },
      })
      .then((response) => {
        //handle success
        console.log(response.data);
      })
      .catch((error) => {
        //handle error
        console.log(`${error}`);
      });
  }
}
