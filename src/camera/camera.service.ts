import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { Recorder } from 'node-rtsp-recorder';
import * as data from './data.json';
import * as FormData from 'form-data';
import * as fs from 'fs';
import axios from 'axios';
import { Cron, CronExpression } from '@nestjs/schedule';
import { execSync } from 'child_process';
interface Recorder {
  recorder: any;
  id: string;
}

@Injectable()
export class CameraService implements OnModuleInit {
  private recorder: Recorder[] = [];
  public date = new Date();
  private logger = new Logger('CAMERA_SERVICE');
  private path = '';
  private CameraConfig: any[];
  private tx = 80;
  private ty = 80;
  private host;
  private connected_camera = [];
  onModuleInit() {
    this.host = process.env.SERVER;
    this.initRecorder();
  }

  @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
  async initRecorder() {
    try {
      await data.map((camera) => {
        try {
          execSync(`sudo ping -c 5 ${camera.ip}`).toString();
          console.log(`ping  success  to ${camera.ip}`)
          this.connected_camera.push(camera);
        } catch (error) {
          console.log(`ping not success  to ${camera.ip}`)
        }
      });
      this.CameraConfig = this.connected_camera;
      console.log('init Recorder');
      for (let i = 0; i < this.CameraConfig.length; i++) {
        const rec = new Recorder({
          camera: this.CameraConfig[i].cameraName,
          folder: process.env.IMAGES_PATH,
          year: this.date.getFullYear().toString(),
          month: (this.date.getMonth() + 1).toString(),
          day: this.date.getDate().toString(),
          type: 'image',
          url: this.CameraConfig[i].url,
        });
        this.recorder.push({
          recorder: rec,
          id: this.CameraConfig[i].ip,
        });
      }
    } catch (error) {
      //console.log(error);
    }
  }

  @Cron(CronExpression.EVERY_10_SECONDS)
  async captureProcess() {
    //await this.recorder.map(async (recItem) => {
    for (let i = 0; i < this.recorder.length; i++) {
      await this.recorder[i].recorder.captureImage(async (fullPath, error) => {
        if (error) {
          //console.log(error);
          return false;
        }
        //console.log('image saved sucefully');

        if (this.CameraConfig[i].uuid === '') {
          //('call create with this image');
          this.PosteCreateId(fullPath, this.CameraConfig[i].cameraName, i);
        } else {
          //this.logger.log('call post with this image');
          this.PostImage(fullPath, this.CameraConfig[i].cameraName, i);
        }
      });
    }
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
      .post(`${this.host}/camera`, formData, {
        headers: {
          accept: 'application/json',
          'Accept-Language': 'en-US,en;q=0.8',
          'Content-Type': 'multipart/form-data',
        },
      })
      .then((response) => {
        //handle success
        //this.logger.log('response from server :');
        //this.logger.log(response.data);
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
        //this.logger.error(`${error}`);
      });
  }

  async deleteImage(path: string) {
    return fs.unlinkSync(path);
  }
  async PostImage(fullPath: string, cameraName: string, cameraIndex: number) {
    // const filename = 'C:/Users/jbray/Desktop/hello.png';
    //console.log(cameraName);
    const formDataRequest = new FormData();
    //console.log(fullPath);
    const image = await fs.createReadStream(fullPath);
    formDataRequest.append('images', image || '');
    // data.append('id', data[cameraIndex].uuid);
    formDataRequest.append('time', new Date().toLocaleString());
    formDataRequest.append('status', 'success' || '');
    formDataRequest.append('location', process.env.LOCATION || '');
    formDataRequest.append('name', cameraName || '');
    // this.logger.log(
    //   `${this.host}/camera/${this.CameraConfig[cameraIndex].uuid}/image`,
    // );
    try {
      //console.log('post image ....');
      const result = await axios.post(
        `${this.host}/camera/${this.CameraConfig[cameraIndex].uuid}/image`,
        formDataRequest,
        {
          headers: {
            accept: 'application/json',
            'Accept-Language': 'en-US,en;q=0.8',
            'Content-Type': 'multipart/form-data',
          },
        },
      );
      //this.logger.log(result.data);
      //delete image
      this.deleteImage(fullPath);
    } catch (error) {
      //this.logger.error(error);
    }
  }

  async getCamraConfig() {
    return this.CameraConfig;
  }
}
