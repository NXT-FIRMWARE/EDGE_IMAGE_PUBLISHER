import { Controller } from '@nestjs/common';
import { PosterService } from './poster.service';

@Controller('poster')
export class PosterController {
  constructor(private readonly posterService: PosterService) {}
}
