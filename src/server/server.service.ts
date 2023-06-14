import { Injectable } from '@nestjs/common';
import * as  fs from 'fs';

@Injectable()
export class ServerService {
  create(image) {
    console.log("post")
    fs.createWriteStream('/home/nextronic/' + image)
    return 'This action adds an image new server';
  }


}
