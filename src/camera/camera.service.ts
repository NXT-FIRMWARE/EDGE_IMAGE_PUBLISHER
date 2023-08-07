import { Injectable, Logger } from '@nestjs/common';
import { Recorder } from 'node-rtsp-recorder';
import * as data from './data.json';
import { createCanvas, loadImage } from 'canvas';
import * as FormData from 'form-data';
import * as fs from 'fs';
import axios from 'axios';
import { Cron, CronExpression } from '@nestjs/schedule';
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
  private CameraConfig: any[];
  private tx = 80;
  private ty = 80;
  constructor() {
    this.initRecorder();
  }

  initRecorder() {
    this.CameraConfig = data;
    console.log('init Recorder');
    for (let i = 0; i < data.length; i++) {
      const rec = new Recorder({
        camera: data[i].cameraName,
        folder: process.env.IMAGES_PATH,
        year: this.date.getFullYear().toString(),
        month: (this.date.getMonth() + 1).toString(),
        day: this.date.getDate().toString(),
        type: 'image',
        url: data[i].url,
      });
      this.recorder.push({
        recorder: rec,
        id: data[i].ip,
      });
    }
  }

  @Cron(CronExpression.EVERY_10_SECONDS)
  async captureProcess() {
    //await this.recorder.map(async (recItem) => {
    for (let i = 0; i < this.recorder.length; i++) {
      await this.recorder[i].recorder.captureImage((fullPath) => {
        this.logger.log('image saved to ', this.recorder[i].recorder.folder);
        console.log('image saved sucefully');
        //this.writeTextonImage(fullPath, Math.random() * 100);
        if (data[i].uuid !== '') {
          this.PosteCreateId(fullPath, data[i].cameraName, i);
        }
        this.PostImage(fullPath, data[i].cameraName, i);
      });
    }
  }

  writeTextonImage(fullPath: string, number) {
    loadImage(fullPath).then((img) => {
      const canvas = createCanvas(img.width, img.height),
        ctx = canvas.getContext('2d');
      ctx.drawImage(img, 0, 0);
      ctx.lineWidth = 2;
      ctx.fillText(
        `Environment SENSOR VALUE : ${number}
      `,
        this.tx,
        this.ty,
      );
      const out = fs.createWriteStream(fullPath),
        stream = canvas.createPNGStream();
      stream.pipe(out);
      out.on('finish', () => console.log('Done'));
    });
  }
  async PosteCreateId(
    fullPath: string,
    cameraName: string,
    indexCamera: number,
  ) {
    const formData = new FormData();
    const image = fs.createReadStream(fullPath);
    formData.append('image', image);
    formData.append('time', new Date().toLocaleString());
    formData.append('location', process.env.LOCATION);
    formData.append('cameraName', cameraName);
    await axios
      .post(`${process.env.SERVER}/camera`, formData, {
        headers: {
          accept: 'application/json',
          'Accept-Language': 'en-US,en;q=0.8',
          'Content-Type': 'multipart/form-data',
        },
      })
      .then((response) => {
        //handle success
        console.log(response.data);
        //load id camera
        this.CameraConfig[indexCamera].uuid = response.data.id;
        fs.writeFileSync('data.json', JSON.stringify(this.CameraConfig));
        //delete image
        this.deleteImage(fullPath);
      })
      .catch((error) => {
        //handle error
        console.log(`${error}`);
      });
  }

  async deleteImage(path: string) {
    return fs.unlinkSync(path);
  }
  async PostImage(filename: string, cameraName: string, cameraIndex: number) {
    // const filename = 'C:/Users/jbray/Desktop/hello.png';
    const data = new FormData();
    const image = fs.createReadStream(filename);
    data.append('images', image);
    // data.append('id', data[cameraIndex].uuid);
    data.append('status', false);

    data.append('time', new Date().toLocaleString());
    data.append('location', process.env.LOCATION);
    data.append('name', cameraName);
    await axios
      .post(
        `${process.env.SERVER}/camera/${this.CameraConfig[cameraIndex].uuid}/image`,
        data,
        {
          headers: {
            accept: 'application/json',
            'Accept-Language': 'en-US,en;q=0.8',
            'Content-Type': 'multipart/form-data',
          },
        },
      )
      .then((response) => {
        //handle success
        console.log(response.data);
        //delete image
        this.deleteImage(`${process.env.IMAGE_PATH}/${filename}`);
        //To  DO remove image from folder
      })
      .catch((error) => {
        //handle error
        console.log(`${error}`);
      });
  }

  getCamraConfig() {
    return this.CameraConfig;
  }
}
