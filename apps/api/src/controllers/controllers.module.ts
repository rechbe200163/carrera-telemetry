import { Module } from '@nestjs/common';
import { ControllersService } from './controllers.service';
import { ControllersController } from './controllers.controller';
import { PrismaService } from 'src/prisma.service';
import { ControllersRepo } from './controller.repo';

@Module({
  controllers: [ControllersController],
  providers: [ControllersService, ControllersRepo, PrismaService],
})
export class ControllersModule {}
