import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { CrashDetectionModule } from './crash-detection/crash-detection.module';

@Module({
  imports: [CrashDetectionModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
