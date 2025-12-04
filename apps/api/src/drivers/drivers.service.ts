import { ConflictException, Injectable } from '@nestjs/common';
import { CreateDriverDto } from './dto/create-driver.dto';
import { UpdateDriverDto } from './dto/update-driver.dto';
import { DriversRepo } from './drivers.repo';

@Injectable()
export class DriversService {
  constructor(private readonly driversRepo: DriversRepo) {}

  async create(createDriverDto: CreateDriverDto) {
    const code = await this.generateUniqueDriverCode(
      createDriverDto.first_name + ' ' + createDriverDto.last_name,
    );
    const sameCodeDriver = await this.driversRepo.findByCode(code);
    if (sameCodeDriver) {
      throw new ConflictException(`Driver with code ${code} already exists`);
    }
    return this.driversRepo.create(createDriverDto, code);
  }

  findAll() {
    return this.driversRepo.findAll();
  }

  findOne(id: number) {
    return this.driversRepo.findById(id);
  }

  update(id: number, updateDriverDto: UpdateDriverDto) {
    return this.driversRepo.update(id, updateDriverDto);
  }

  remove(id: number) {
    return `This action removes a #${id} driver`;
  }

  private async generateUniqueDriverCode(name: string): Promise<string> {
    const names = name.trim().split(/\s+/);
    const first = names[0] ?? '';
    const last = names.length > 1 ? names[names.length - 1] : '';

    const up = (s: string) => s.substring(0, 3).toUpperCase();

    const candidates: string[] = [];

    // 1) Basis: MIC
    if (first) {
      candidates.push(up(first));
    }

    if (first && last) {
      const f2 = first.substring(0, 2);
      const l1 = last.substring(0, 1);
      const l2 = last.substring(0, 2);
      const l3 = last.substring(0, 3);

      // 2) RMI: 1. Buchstabe Nachname + 2 vom Vornamen
      candidates.push((l1 + f2).toUpperCase());

      // 3) REM: 2 Buchstaben Nachname + 1. Buchstabe Vorname
      candidates.push((l2 + first.substring(0, 1)).toUpperCase());

      // 4) REC: 3 Buchstaben Nachname
      candidates.push(l3.toUpperCase());
    }

    // Duplikate rausfiltern (falls z.B. Name zu kurz ist)
    const seen = new Set<string>();
    const uniqueCandidates = candidates.filter((c) => {
      if (!c || c.length === 0) return false;
      if (seen.has(c)) return false;
      seen.add(c);
      return true;
    });

    // Kandidaten der Reihe nach durchprobieren
    for (const code of uniqueCandidates) {
      const exists = await this.checkIfCodeExists(code);
      if (!exists) {
        return code;
      }
    }

    // Optionaler ultra-Notfall (wenn wirklich alles voll ist):
    // hier könntest du z.B. zufällig generieren oder doch eine Zahl anhängen.
    // Ich lass dir mal eine simple Variante kommentiert:
    /*
  let counter = 1;
  while (true) {
    const fallback = (uniqueCandidates[0] ?? "DRV").substring(0, 2) + counter;
    if (!(await this.checkIfCodeExists(fallback))) {
      return fallback.toUpperCase();
    }
    counter++;
  }
  */

    // Falls du GAR KEINE Zahlen willst und damit leben kannst,
    // dass es im Extremfall crasht:
    throw new ConflictException(
      'Unable to generate unique driver code, all candidates are taken.',
    );
  }

  private checkIfCodeExists(code: string): Promise<boolean> {
    // if exists gen code by using
    return this.driversRepo.existsByCode(code);
  }
}
