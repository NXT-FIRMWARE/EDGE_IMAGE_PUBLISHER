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
    await this.initFtpClient();
    await this.filesUploader();
  }

  @Cron(CronExpression.EVERY_10_SECONDS)
  async filesUploader() {
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
        //console.log(daysPath);
        for (let daysIndex = 0; daysIndex < daysPath.length; daysIndex++) {
          console.log(
            `/${yearsPath[yearsIndex]}/${monthsPath[monthsIndex]}/${daysPath[daysIndex]}`,
          );

          const files = fs.readdirSync(
            path.join(
              this.path,
              yearsPath[yearsIndex],
              monthsPath[monthsIndex],
              daysPath[daysIndex],
            ),
          );
          console.log(files);
          await this.ftpClient.ensureDir(
            `/${yearsPath[yearsIndex]}/${monthsPath[monthsIndex]}/${daysPath[daysIndex]}`,
          );
          for (let i = 0; i < files.length; i++) {
            await this.ftpClient.uploadFrom(
              path.join(
                this.path,
                yearsPath[yearsIndex],
                monthsPath[monthsIndex],
                daysPath[daysIndex],
                files[i],
              ),
              `${files[i]}`,
            );
            fs.unlinkSync(
              path.join(
                this.path,
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
  async initFtpClient() {
    await this.ftpClient.access({
      host: process.env.FTP_HOST,
      user: process.env.FTP_USERNAME,
      password: process.env.FTP_PASSWORD,
      type: 'ftp',
    });
    console.log(await this.ftpClient.list());
    //await this.ftpClient.ensureDir("my/remote/directory")
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
    //console.log(path);
    return fs.readdirSync(path);
  }
}
