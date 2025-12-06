import { Module } from '@nestjs/common';
import { ChampionshipsController } from './championships.controller';
import { ChampionshipsRepo } from './championships.repo';
import { ChampionshipsService } from './championships.service';
import { PrismaService } from 'src/prisma.service';
import { MeetingsModule } from 'src/meetings/meetings.module';

@Module({
  imports: [MeetingsModule],
  controllers: [ChampionshipsController],
  providers: [ChampionshipsService, ChampionshipsRepo, PrismaService],
})
export class ChampionshipsModule {}
