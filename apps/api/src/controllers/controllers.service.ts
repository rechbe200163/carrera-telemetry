import { Injectable } from '@nestjs/common';
import { CreateControllerDto } from './dto/create-controller.dto';
import { UpdateControllerDto } from './dto/update-controller.dto';
import { ControllersRepo } from './controller.repo';

@Injectable()
export class ControllersService {
  constructor(private readonly controllersRepo: ControllersRepo) {}

  create(createControllerDto: CreateControllerDto) {
    return this.controllersRepo.create(createControllerDto);
  }

  findAll() {
    return this.controllersRepo.findAll();
  }

  findOne(id: number) {
    return this.controllersRepo.findById(id);
  }

  update(id: number, updateControllerDto: UpdateControllerDto) {
    return this.controllersRepo.update(id, updateControllerDto);
  }

  remove(id: number) {
    return this.controllersRepo.remove(id);
  }
}
