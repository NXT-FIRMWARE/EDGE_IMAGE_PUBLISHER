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
      await this.recorder[i].recorder.captureImage(async (fullPath) => {
        console.log('image saved sucefully');
        await this.writeTextonImage(
          fullPath,
          (Math.random() * 100).toFixed(1),
          i,
        );
        // if (data[i].uuid === '') {
        //   this.logger.log('call create with this image');
        //   await this.PosteCreateId(fullPath, data[i].cameraName, i);
        // } else {
        //   this.logger.log('call post with this image');
        //   await this.PostImage(fullPath, data[i].cameraName, i);
        // }
      });
    }
  }

  async writeTextonImage(fullPath: string, number, index: number) {
    await loadImage(fullPath).then(async (img) => {
      const canvas = createCanvas(img.width, img.height),
        ctx = canvas.getContext('2d');
      ctx.drawImage(img, 0, 0);
      ctx.lineWidth = 2;
      ctx.font = 'bold 70pt Menlo';
      ctx.fillText(
        `Environment SENSOR VALUE : ${number}
      `,
        this.tx,
        this.ty,
      );
      const out = await fs.createWriteStream(fullPath),
        stream = canvas.createPNGStream();
      stream.pipe(out);
      out.on('finish', () => {
        console.log('test');
        if (data[index].uuid === '') {
          this.logger.log('call create with this image');
          this.PosteCreateId(fullPath, data[index].cameraName, index);
        } else {
          this.logger.log('call post with this image');
          this.PostImage(fullPath, data[index].cameraName, index);
        }
      });
    });
  }
  async PosteCreateId(
    fullPath: string,
    cameraName: string,
    indexCamera: number,
  ) {
    const formData = new FormData();
    const image = await fs.createReadStream(fullPath);
    formData.append('images', image);
    //formData.append('time', new Date().toLocaleString());
    formData.append('status', 'success');
    formData.append('location', process.env.LOCATION);
    formData.append('name', cameraName);
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
        this.logger.log('response from server :');
        this.logger.log(response.data);
        //load id camera
        this.CameraConfig[indexCamera].uuid = response.data._id;
        fs.writeFileSync(
          `${__dirname}/src/camera/data.json`,
          JSON.stringify(this.CameraConfig),
        );
        //delete image
        this.deleteImage(fullPath);
      })
      .catch((error) => {
        //handle error
        this.logger.error(`${error}`);
      });
  }

  async deleteImage(path: string) {
    return fs.unlinkSync(path);
  }
  async PostImage(fullPath: string, cameraName: string, cameraIndex: number) {
    // const filename = 'C:/Users/jbray/Desktop/hello.png';
    const formData = new FormData();
    const image = fs.createReadStream(fullPath);
    formData.append('images', image);
    // data.append('id', data[cameraIndex].uuid);
    //data.append('time', new Date().toLocaleString());
    formData.append('status', 'success');
    formData.append('location', process.env.LOCATION);
    formData.append('name', cameraName);
    this.logger.log(
      `${process.env.SERVER}/camera/${this.CameraConfig[cameraIndex].uuid}/image`,
    );
    try {
      const result = await axios.post(
        `${process.env.SERVER}/camera/${this.CameraConfig[cameraIndex].uuid}/image`,
        formData,
        {
          headers: {
            accept: 'application/json',
            'Accept-Language': 'en-US,en;q=0.8',
            'Content-Type': 'multipart/form-data',
          },
        },
      );
      this.logger.log(result.data);
      //delete image
      this.deleteImage(fullPath);
    } catch (error) {
      this.logger.error(error);
    }
  }

  async getCamraConfig() {
    return this.CameraConfig;
  }
}
