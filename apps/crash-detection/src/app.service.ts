import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  health(): number {
    return 200;
  }
}
