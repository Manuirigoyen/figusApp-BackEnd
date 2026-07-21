import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateStickerDto } from './dto/create-sticker.dto';
import { UpdateStickerDto } from './dto/update-sticker.dto';
import { Sticker } from './entities/sticker.entity';
import { UploadsService } from '../uploads/uploads.service';

/**
 * Servicio para la gestión de operaciones CRUD de Stickers.
 */
@Injectable()
export class StickersService {
  constructor(
    @InjectRepository(Sticker)
    private readonly stickersRepository: Repository<Sticker>,
    private readonly uploadsService: UploadsService,
  ) {}

  /**
   * Crea un nuevo sticker en la base de datos.
   * @param createStickerDto Datos del sticker.
   * @returns El sticker creado.
   */
  async create(createStickerDto: CreateStickerDto): Promise<Sticker> {
    const sticker = this.stickersRepository.create(createStickerDto);
    return await this.stickersRepository.save(sticker);
  }

  /**
   * Resuelve el cover_image de un sticker a una URL utilizable por el frontend.
   */
  private async resolveStickerImage(sticker: Sticker): Promise<Sticker> {
    const [cover_image] = await this.uploadsService.resolveManyImageUrls([
      sticker.cover_image,
    ]);

    return { ...sticker, cover_image };
  }

  /**
   * Resuelve el cover_image de una lista de stickers en un solo lote.
   */
  private async resolveStickerImages(stickers: Sticker[]): Promise<Sticker[]> {
    const resolvedCovers = await this.uploadsService.resolveManyImageUrls(
      stickers.map((sticker) => sticker.cover_image),
    );

    return stickers.map((sticker, index) => ({
      ...sticker,
      cover_image: resolvedCovers[index],
    }));
  }

  async findAll(): Promise<Sticker[]> {
    const stickers = await this.stickersRepository.find({
      relations: { album: true },
    });

    return this.resolveStickerImages(stickers);
  }

  async findOne(id: number): Promise<Sticker | null> {
    const sticker = await this.stickersRepository.findOne({
      where: { id },
      relations: { album: true },
    });

    if (!sticker) return null;

    return this.resolveStickerImage(sticker);
  }

  async findByAlbum(albumId: number): Promise<Sticker[]> {
    const stickers = await this.stickersRepository.find({
      where: { album_id: albumId },
      relations: { album: true },
    });

    return this.resolveStickerImages(stickers);
  }

  async update(id: number, updateStickerDto: UpdateStickerDto): Promise<Sticker | null> {
    await this.stickersRepository.update(id, updateStickerDto);
    return this.findOne(id);
  }

  /**
   * Elimina un sticker y sus archivos asociados en Supabase.
   * @param id ID del sticker a eliminar.
   */
  async remove(id: number): Promise<void> {
    const sticker = await this.findOne(id);
    if (!sticker) throw new NotFoundException(`Sticker #${id} not found`);

    await this.stickersRepository.delete(id);
    await this.uploadsService.removeStickerDirectory(sticker.album_id, id);
  }
}