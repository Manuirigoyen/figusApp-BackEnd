import { Injectable, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { CreatePackDto } from "./dto/create-pack.dto";
import { UpdatePackDto } from "./dto/update-pack.dto";
import { Pack } from "./entities/pack.entity";
import { UploadsService } from "../uploads/uploads.service";

/**
 * Servicio para gestión de operaciones CRUD de Packs.
 */
@Injectable()
export class PacksService {
  constructor(
    @InjectRepository(Pack)
    private readonly packsRepository: Repository<Pack>,
    private readonly uploadsService: UploadsService,
  ) {}

  /**
   * Crea un nuevo pack en la base de datos.
   * @param createPackDto Datos del pack.
   * @returns El pack creado.
   */
  async create(createPackDto: CreatePackDto): Promise<Pack> {
    const pack = this.packsRepository.create({
      ...createPackDto,
      capacity: createPackDto.capacity ?? 5,
    });

    return await this.packsRepository.save(pack);
  }

  /**
   * Obtiene todos los packs con sus relaciones de álbum.
   * @returns Lista de packs.
   */
  async findAll(): Promise<Pack[]> {
    return this.packsRepository.find({
      relations: { album: true },
    });
  }

  /**
   * Busca un pack por su ID.
   * @param id ID del pack.
   * @returns El pack encontrado o null.
   */
  async findOne(id: number): Promise<Pack | null> {
    return this.packsRepository.findOne({
      where: { id },
      relations: { album: true },
    });
  }

  /**
   * Actualiza los datos de un pack existente.
   * @param id ID del pack.
   * @param updatePackDto Datos a actualizar.
   * @returns El pack actualizado.
   */
  async update(id: number, updatePackDto: UpdatePackDto): Promise<Pack | null> {
    await this.packsRepository.update(id, {
      ...updatePackDto,
      capacity: updatePackDto.capacity ?? undefined,
    });

    return this.findOne(id);
  }

  /**
   * Elimina un pack y limpia sus archivos asociados en Supabase.
   * @param id ID del pack a eliminar.
   */
  async remove(id: number): Promise<void> {
    const pack = await this.findOne(id);

    if (!pack) {
      throw new NotFoundException(`Pack #${id} not found`);
    }

    await this.packsRepository.delete(id);
    await this.uploadsService.removePackDirectory(id);
  }
}
