import { BadRequestException, Injectable } from '@nestjs/common';
import { CreateSessionEntryDto } from './dto/create-session-entry.dto';
import { SessionEntriesRepo } from './session-entry.repo';

@Injectable()
export class SessionEntriesService {
  constructor(private readonly repo: SessionEntriesRepo) {}

  async assignDriverToController(
    sessionId: number,
    dto: CreateSessionEntryDto,
  ) {
    // 1) Controller in der Session schon vergeben?
    const existingByController = await this.repo.findBySessionAndController(
      sessionId,
      dto.controller_address,
    );
    if (existingByController) {
      throw new BadRequestException(
        `Controller ${dto.controller_address} ist in dieser Session bereits zugewiesen.`,
      );
    }

    // 2) Fahrer in der Session schon eingetragen?
    const existingByDriver = await this.repo.findBySessionAndDriver(
      sessionId,
      dto.driver_id,
    );
    if (existingByDriver) {
      throw new BadRequestException(
        `Driver ${dto.driver_id} hat in dieser Session bereits einen Controller.`,
      );
    }

    // 3) Anlegen
    return this.repo.create({
      session_id: sessionId,
      driver_id: dto.driver_id,
      controller_address: dto.controller_address,
      controller_id: dto.controller_id ?? null,
      car_label: dto.car_label ?? null,
    });
  }

  async listEntries(sessionId: number) {
    return this.repo.listEntriesForSession(sessionId);
  }
}
