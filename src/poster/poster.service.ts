import { Injectable , Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';

@Injectable()
export class PosterService {
  private logger = new Logger('Poster');

  constructor() {
    this.postImages();
  }

  postImages() {

  }
}
