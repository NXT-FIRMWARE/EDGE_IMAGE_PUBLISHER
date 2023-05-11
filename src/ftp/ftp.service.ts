import { Injectable, Logger } from '@nestjs/common';
import * as ftp from 'basic-ftp';
import { Cron, CronExpression } from '@nestjs/schedule';
import * as fs from 'fs';
import * as path from 'path';
@Injectable()
export class FtpService {
  private ftpClient;

  private path;

  private ftpFolder;

  private logger = new Logger('FTP');

  constructor() {
    this.path = process.env.IMAGES_PATH;

    this.ftpClient = new ftp.Client();

    this.bootstrap();
  }

  async bootstrap() {
    this.initFtpClient();
    //console.log(this.getDirectories(this.path));
    const yearsPath = this.getDirectories(this.path);
    for (let yearsIndex = 0; yearsIndex < yearsPath.length; yearsIndex++) {
      //console.log(yearsPath[i]);
      const monthsPath = this.getDirectories(
        path.join(this.path, yearsPath[yearsIndex]),
      );
      for (
        let monthsIndex = 0;
        monthsIndex < monthsPath.length;
        monthsIndex++
      ) {
        const daysPath = this.getDirectories(
          path.join(this.path, yearsPath[yearsIndex], monthsPath[monthsIndex]),
        );
        console.log(daysPath);
        for (let daysIndex = 0; daysIndex < daysPath.length; daysIndex++) {
          console.log(daysPath[daysIndex]);

          await this.ftpClient.ensureDir(
            `${yearsPath[yearsIndex]},${monthsPath[monthsIndex]}/${daysPath[daysIndex]}`,
          );

          // const files = fs.readdirSync(
          //   path.join(
          //     this.path,
          //     yearsPath[yearsIndex],
          //     monthsPath[monthsIndex],
          //     daysPath[daysIndex],
          //   ),
          // );
          // console.log(files);
        }
      }
    }
  }

  initFtpClient() {
    this.ftpClient.access({
      host: process.env.FTP_HOST,
      user: process.env.FTP_USERNAME,
      password: process.env.FTP_PASSWORD,
      type: 'ftp',
    });
  }

  // @Cron(CronExpression.EVERY_30_SECONDS)
  // uploadHandler() {
  //   this.ftpTreeConfiguration();
  //   this.ftpFilesUploader();
  // }

  ftpFilesUploader() {
    console.log(this.getDirectories(this.path));
  }

  getDirectories(path) {
    console.log(path);
    return fs.readdirSync(path);
  }
  // ftpTreeConfiguration() {
  //   const date = new Date();
  //   const yearPath = date.getFullYear().toString();
  //   const monthPath = (date.getMonth() + 1).toString();
  //   const dayPath = date.getDate().toString();
  //   this.ftpFolder = `${yearPath}/${monthPath}/${dayPath}`;
  //   this.ftpClient.exist(yearPath, function (exist) {
  //     if (!exist) {
  //       this.ftpClient.mkdir(yearPath, function (err) {});
  //     }
  //   });

  //   this.ftpClient.exist(`${yearPath}/${monthPath}`, function (exist) {
  //     if (!exist) {
  //       this.ftpClient.mkdir(`${yearPath}/${monthPath}`, function (err) {});
  //     }
  //   });

  //   this.ftpClient.exist(
  //     `${yearPath}/${monthPath}/${dayPath}`,
  //     function (exist) {
  //       if (!exist) {
  //         this.ftpClient.mkdir(
  //           `${yearPath}/${monthPath}/${dayPath}`,
  //           function (err) {},
  //         );
  //       }
  //     },
  //   );
  // }
}
