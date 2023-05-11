import { Module } from '@nestjs/common';
import { SaverService } from './saver.service';

@Module({
  providers: [SaverService]
})
export class SaverModule {}
