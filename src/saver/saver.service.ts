import { Injectable, Logger } from '@nestjs/common';
import * as NodeWebcam from 'node-webcam';
import * as path from 'path';
import { Cron, CronExpression, Interval } from '@nestjs/schedule';
import * as fs from 'fs';

@Injectable()
export class SaverService {
  private deltaTime: number;

  private path: string;

  private logger = new Logger('imageSaver');

  private currentImagePath;

  private camera;

  constructor() {
    this.camera = NodeWebcam.create({});
    this.path = process.env.IMAGES_PATH.replace(/(\s+)/g, '\\$1');
    this.currentImagePath = this.getCurrentImagePath();
    this.deltaTime = parseInt(process.env.DELTA_TIME);

    this.bootstrap();
  }
  bootstrap() {
    setInterval(async () => {
      this.logger.log('[d] trying to capture image');
      this.captureImage();
    }, this.deltaTime);
  }
  getCurrentImagePath() {
    const date = new Date();
    const yearPath = date.getFullYear().toString();
    const monthPath = (date.getMonth() + 1).toString();
    const dayPath = date.getDate().toString();
    const hourPath = date.getHours().toString();
    const minutesPath = date.getMinutes().toString();
    const seconds = date.getSeconds().toString();
    this.logger.log(`${yearPath}/${monthPath}/${dayPath}_${hourPath}:${minutesPath}:${seconds}`);
    return {
      imageFolderPath: `${yearPath}/${monthPath}/${dayPath}/`,
      imageFilename: `${yearPath}-${monthPath}-${dayPath}_${hourPath}-${minutesPath}-${seconds}`,
    };
  }

  createFolderIfNotExist(folder) {
    this.logger.log(path.join(process.env.IMAGES_PATH, folder));
    if (!fs.existsSync(path.join(process.env.IMAGES_PATH, folder))) {
      fs.mkdir(path.join(process.env.IMAGES_PATH, folder), (err: any) => {
        if (err) return this.logger.error(err);
      });
    }
  }
  @Interval(1000 * 60)
  filesTreeHandler() {
    this.currentImagePath = this.getCurrentImagePath();

    //check year if exist
    this.createFolderIfNotExist(
      this.currentImagePath.imageFolderPath.split('/')[0],
    );
    this.createFolderIfNotExist(
      `${this.currentImagePath.imageFolderPath.split('/')[0]}/${
        this.currentImagePath.imageFolderPath.split('/')[1]
      }`,
    );
    this.createFolderIfNotExist(
      `${this.currentImagePath.imageFolderPath.split('/')[0]}/${
        this.currentImagePath.imageFolderPath.split('/')[1]
      }/${this.currentImagePath.imageFolderPath.split('/')[2]}/`,
    );
  }

  //@Interval(DELTA_TIME)
  // captureHandler() {
  //   this.logger.log('[d] trying to capture image');
  //   this.captureImage();
  // }

  captureImage() {
    this.currentImagePath = this.getCurrentImagePath();
    console.log(this.path)
    console.log(this.currentImagePath.imageFolderPath)
    console.log(`${this.currentImagePath.imageFilename}.png`)
    console.log(
      path.join(
        this.path,
        this.currentImagePath.imageFolderPath,
        `${this.currentImagePath.imageFilename}.png`,
      ),
    );
    this.camera.capture(
      path.join(
        this.path,
        this.currentImagePath.imageFolderPath,
        `${this.currentImagePath.imageFilename}.png`,
      ),
      function (err, data) {
        if (!err) {
          console.log('[i] image creacted');
        } else {
          console.log(err);
        }
      },
    );
  }
}
