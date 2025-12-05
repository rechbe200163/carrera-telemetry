import { Module } from '@nestjs/common';
import { SessionsService } from './sessions.service';
import { SessionsController } from './sessions.controller';
import { SessionsRepo } from './sessions.repo';
import { PrismaService } from 'src/prisma.service';

@Module({
  controllers: [SessionsController],
  providers: [SessionsService, SessionsRepo, PrismaService],
})
export class SessionsModule {}
