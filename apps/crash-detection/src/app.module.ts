import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { CrashDetectionModule } from './crash-detection/crash-detection.module';
import { CustomPrismaModule } from 'nestjs-prisma';
import { PrismaClient } from 'prisma/src/generated/client';

@Module({
  imports: [
    CustomPrismaModule.forRoot({
      isGlobal: true,
      name: 'PrismaService',
      client: new PrismaClient({
        transactionOptions: {
          maxWait: 5000,
          timeout: 10000,
        },
        accelerateUrl: process.env.DATABASE_URL || '',
      }),
    }),
    CrashDetectionModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
