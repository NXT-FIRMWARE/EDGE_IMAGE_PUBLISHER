import { Injectable, Logger } from '@nestjs/common';
const Recorder = require('node-rtsp-recorder').Recorder



@Injectable()
export class CameraService {
  private logger = new Logger('cameraIp');
  
  private camera;

  constructor() {
    this.camera = new Recorder({
        url: 'rtsp://admin:admin@192.168.20.10:554/Streaming/Channels/101',
        folder: '/home/nextronic/RECORDER-FTP-NEST/',
        name: 'Image',
        type : 'image',

        
    })
    
    this.bootstrap();
  }
  bootstrap() {
    this.logger.log("Camera ", this.camera.url);
    // this.captureImage();
    this.camera.captureImage(() => {
      console.log('Image Captured')
  })
  console.log("done")
  
  }
  captureImage(){
    this.logger.log("start Recording ");
    this.camera.captureImage(() => {
      console.log('Image Captured')
  })
  }
}
