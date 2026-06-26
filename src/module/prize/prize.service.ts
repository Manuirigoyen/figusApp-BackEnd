import {
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { Prize } from './entities/prize.entity';

import { CreatePrizeDto } from './dto/create-prize.dto';
import { UpdatePrizeDto } from './dto/update-prize.dto';

/**
 * Servicio principal para operaciones CRUD de Prize.
 */
@Injectable()
export class PrizeService {
  constructor(
    @InjectRepository(Prize)
    private readonly prizeRepository: Repository<Prize>,
  ) {}

  /**
   * Crear premio.
   */
  async create(createPrizeDto: CreatePrizeDto): Promise<Prize> {
    const prize = this.prizeRepository.create(createPrizeDto);

    return await this.prizeRepository.save(prize);
  }

  /**
   * Obtener todos los premios con sus relaciones completas.
   */
  async findAll(): Promise<Prize[]> {
    return await this.prizeRepository.find({
      relations: ['sticker', 'packBronce', 'packPlateado', 'packDorado'],
    });
  }

  /**
   * Obtener premio por ID con sus relaciones completas.
   */
  async findOne(id: number): Promise<Prize> {
    const prize = await this.prizeRepository.findOne({
      where: { id },
      relations: ['sticker', 'packBronce', 'packPlateado', 'packDorado'],
    });

    if (!prize) {
      throw new NotFoundException(`Prize #${id} not found`);
    }

    return prize;
  }

  /**
   * Actualizar premio.
   */
  async update(
    id: number,
    updatePrizeDto: UpdatePrizeDto,
  ): Promise<Prize> {
    const prize = await this.findOne(id);

    Object.assign(prize, updatePrizeDto);

    return await this.prizeRepository.save(prize);
  }

  /**
   * Eliminar premio.
   */
  async remove(id: number): Promise<void> {
    await this.findOne(id);

    await this.prizeRepository.delete(id);
  }
}