import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import * as ftp from 'basic-ftp';
import { Cron, CronExpression , SchedulerRegistry} from '@nestjs/schedule';
import * as fs from 'fs';
import * as path from 'path';
import { exec, execSync } from 'child_process';

@Injectable()
export class FtpService implements OnModuleInit {
  private ftpClient;

  private path;

  private ftpFolder;

  private logger = new Logger('FTP');

  private cron;
  private result;
  private ip;
  private connectionClosed = false;

  constructor(private readonly scheduleRegistry: SchedulerRegistry) {
  }
  
  onModuleInit() {
    this.path = process.env.IMAGES_PATH;
    this.ftpClient = new ftp.Client();
    this.bootstrap();
  }
  async bootstrap() {
    await this.initFtpClient();
    this.cron = this.scheduleRegistry.getCronJob('ftp');

    // this.cron.start();
    // setInterval(async () => {
    //   await this.filesUploader();
    // }, 5000);
    //await this.filesUploader();
  }

  @Cron('*/1 * * * *',{
    name:"ftp"
  })
  async filesUploader() {
    this.cron.stop();
    this.logger.log('[d]  upload files to ftp ...')
    const cameraPath =this.getDirectories(this.path);
    
    for (let camerIndex = 0; camerIndex < cameraPath.length; camerIndex++) {

    const yearsPath = this.getDirectories(
      path.join(this.path,cameraPath[camerIndex])
    );
    for (let yearsIndex = 0; yearsIndex < yearsPath.length; yearsIndex++) {
      //console.log(yearsPath[i]);
      const monthsPath = this.getDirectories(
        path.join(this.path,cameraPath[camerIndex], yearsPath[yearsIndex]),
      );
      for (
        let monthsIndex = 0;
        monthsIndex < monthsPath.length;
        monthsIndex++
      ) {
        const daysPath = this.getDirectories(
          path.join(this.path,cameraPath[camerIndex], yearsPath[yearsIndex], monthsPath[monthsIndex]),
        );
        //console.log(daysPath);
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
          await this.ftpClient.ensureDir('/');
          await this.ftpClient.ensureDir(
            `${cameraPath[camerIndex]}/${yearsPath[yearsIndex]}/${monthsPath[monthsIndex]}/${daysPath[daysIndex]}`,
          );
          for (let i = 0; i < files.length; i++) {
            console.log("uploading")
            await this.ftpClient.uploadFrom(
              path.join(
                this.path,
                cameraPath[camerIndex],
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
                cameraPath[camerIndex],
                yearsPath[yearsIndex],
                monthsPath[monthsIndex],
                daysPath[daysIndex],
                files[i],
              ),
            );
          }
        }
      }}
    }
    this.cron.start();
  }
  async initFtpClient() {
    this.result = await this.ftpClient.access({
      host: process.env.FTP_HOST,
      user: process.env.FTP_USERNAME,
      password: process.env.FTP_PASSWORD,
      type: 'ftp',
    });
 
    // this.ftpClient.ftp.verbose = true
    //console.log(await this.ftpClient.list());
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

// every 2 min
  @Cron('*/2 * * * *')
  // @Cron(CronExpression.EVERY_30_SECONDS)
  async checkConnection(){
     try {
      this.ip = execSync(' nmcli device show wlan0 | grep IP4.ADDRESS').toString();
      console.log("try ip", this.ip)
      if(this.connectionClosed){
        console.log('initiating the ftp')
       await this.initFtpClient().then(()=>{
        if(this.result.code ===220){
          console.log('connection closed false')
          this.connectionClosed = false
        }
       })   
      }
    } catch (error) {
      this.ip = null
      this.connectionClosed = true
      console.log("catch", this.ip)
      
    }
  }
}
