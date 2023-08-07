import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { Cron, SchedulerRegistry } from '@nestjs/schedule';
import * as fs from 'fs';
import * as path from 'path';
import { execSync } from 'child_process';
import axios from 'axios';
import { CameraService} from 'src/camera/camera.service';
import * as FormData from 'form-data';

@Injectable()
export class PosterService implements OnModuleInit {
  private path;
  private ftpFolder;
  private logger = new Logger('FTP');
  private cron;
  private result;
  private ip;
  private connectionClosed = false;
  private cameraConfig: any[];

  constructor(
    private readonly scheduleRegistry: SchedulerRegistry,
    private readonly cameraService: CameraService,
  ) {}

  onModuleInit() {
    this.path = process.env.IMAGES_PATH;
  }

  @Cron('* * * * *')
  async filesUploader() {
    this.cameraConfig = this.cameraService.getCamraConfig();
    this.logger.log('[d]  upload files to server ...');
    try {
      const cameraPath = this.getDirectories(this.path);
      for (let camerIndex = 0; camerIndex < cameraPath.length; camerIndex++) {
        const yearsPath = this.getDirectories(
          path.join(this.path, cameraPath[camerIndex]),
        );
        for (let yearsIndex = 0; yearsIndex < yearsPath.length; yearsIndex++) {
          const monthsPath = this.getDirectories(
            path.join(this.path, cameraPath[camerIndex], yearsPath[yearsIndex]),
          );
          for (
            let monthsIndex = 0;
            monthsIndex < monthsPath.length;
            monthsIndex++
          ) {
            const daysPath = this.getDirectories(
              path.join(
                this.path,
                cameraPath[camerIndex],
                yearsPath[yearsIndex],
                monthsPath[monthsIndex],
              ),
            );
            for (let daysIndex = 0; daysIndex < daysPath.length; daysIndex++) {
              console.log(
                `${this.path}/${cameraPath[camerIndex]}/${yearsPath[yearsIndex]}/${monthsPath[monthsIndex]}/${daysPath[daysIndex]}`,
              );

              const files = fs.readdirSync(
                path.join(
                  this.path,
                  cameraPath[camerIndex],
                  yearsPath[yearsIndex],
                  monthsPath[monthsIndex],
                  daysPath[daysIndex],
                ),
              );
              console.log(files);
              for (let i = 0; i < files.length && files.length > 5; i++) {
                console.log('uploading');
                this.PostImage(
                  cameraPath[camerIndex],
                  path.join(
                    this.path,
                    cameraPath[camerIndex],
                    yearsPath[yearsIndex],
                    monthsPath[monthsIndex],
                    daysPath[daysIndex],
                    files[i],
                  ),camerIndex
                );
                fs.unlinkSync(
                  path.join(
                    this.path,
                    cameraPath[camerIndex],
                    yearsPath[yearsIndex],
                    monthsPath[monthsIndex],
                    daysPath[daysIndex],
                    files[i],
                  ),
                );
              }
            }
          }
        }
      }
    } catch (error) {
      this.logger.log('error');
    }
  }

  getDirectories(path) {
    //console.log(path);
    return fs.readdirSync(path);
  }
  async PostImage(cameraName: string, fullPath: string, cameraIndex) {
    // const filename = 'C:/Users/jbray/Desktop/hello.png';
    const data = new FormData();
    const image = fs.createReadStream(fullPath);
    data.append('image', image);
    data.append('id', this.cameraConfig[cameraIndex].uuid);
    data.append('time', new Date().toLocaleString());
    data.append('location', process.env.LOCATION);
    data.append('cameraName', cameraName);
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
        //delete image
        this.deleteImage(`${fullPath}`);
        //To  DO remove image from folder
      })
      .catch((error) => {
        //handle error
        console.log(`${error}`);
      });
  }
  async deleteImage(path: string) {
    return fs.unlinkSync(path);
  }
}
