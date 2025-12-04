import { Module } from '@nestjs/common';
import { DriversService } from './drivers.service';
import { DriversController } from './drivers.controller';
import { PrismaService } from 'src/prisma.service';
import { DriversRepo } from './drivers.repo';

@Module({
  controllers: [DriversController],
  providers: [DriversService, DriversRepo, PrismaService],
})
export class DriversModule {}
