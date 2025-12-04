import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { RacesModule } from './races/races.module';
import { DriversModule } from './drivers/drivers.module';
import { CarsModule } from './cars/cars.module';
import { LapTimesModule } from './lap-times/lap-times.module';
import { CustomPrismaModule } from 'nestjs-prisma';
import { PrismaClient } from 'generated/prisma/client';

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
    RacesModule,
    DriversModule,
    CarsModule,
    LapTimesModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
