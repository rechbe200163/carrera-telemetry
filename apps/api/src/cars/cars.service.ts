import { Injectable } from '@nestjs/common';
import { CreateCarDto } from './dto/create-car.dto';
import { UpdateCarDto } from './dto/update-car.dto';
import { CarsRepository } from './cars.repository';

@Injectable()
export class CarsService {
  constructor(private readonly carsRepository: CarsRepository) {}
  create(createCarDto: CreateCarDto) {
    return this.carsRepository.create(createCarDto);
  }

  findAll() {
    return this.carsRepository.findAll();
  }

  findOne(id: number) {
    return this.carsRepository.findOne(id);
  }

  update(id: number, updateCarDto: UpdateCarDto) {
    return this.carsRepository.update(id, updateCarDto);
  }

  remove(id: number) {
    return `This action removes a #${id} car`;
  }
}
