import { Module } from '@nestjs/common';
import { CrashDetectionService } from './crash-detection.service';
import { CrashDetectionController } from './crash-detection.controller';

@Module({
  controllers: [CrashDetectionController],
  providers: [CrashDetectionService],
})
export class CrashDetectionModule {}
