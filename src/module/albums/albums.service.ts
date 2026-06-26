import { Injectable, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { CreateAlbumDto } from "./dto/create-album.dto";
import { UpdateAlbumDto } from "./dto/update-album.dto";
import { Album } from "./entities/album.entity";
import { UserAlbumSticker } from "./entities/user-album-sticker.entity";
import { Winner } from "./entities/winner.entity";
import { Sticker } from "../stickers/entities/sticker.entity";
import { UploadsService } from "../uploads/uploads.service";

/**
 * Servicio para la gestión de álbumes.
 */
@Injectable()
export class AlbumsService {
  constructor(
    @InjectRepository(Album)
    private readonly albumsRepository: Repository<Album>,
    @InjectRepository(Sticker)
    private readonly stickersRepository: Repository<Sticker>,
    @InjectRepository(UserAlbumSticker)
    private readonly userAlbumStickersRepository: Repository<UserAlbumSticker>,
    @InjectRepository(Winner)
    private readonly winnersRepository: Repository<Winner>,
    private readonly uploadsService: UploadsService,
  ) {}

  /**
   * Crea un nuevo álbum en el sistema.
   * @param createAlbumDto Datos del álbum a crear.
   * @returns El álbum guardado.
   */
  async create(createAlbumDto: CreateAlbumDto): Promise<Album> {
    const album = this.albumsRepository.create(createAlbumDto);
    const savedAlbum = await this.albumsRepository.save(album);

    if (!savedAlbum?.id) {
      throw new Error("Saved album has no id");
    }

    return savedAlbum;
  }

  /**
   * Obtiene todos los álbumes junto con sus packs asociados.
   * @returns Lista de álbumes.
   */
  async findAll(): Promise<Album[]> {
    return this.albumsRepository.find({
      relations: {
        packs: true,
      },
    });
  }

  /**
   * Busca un álbum específico por su ID.
   * @param id Identificador del álbum.
   * @returns El álbum encontrado o null.
   */
  async findOne(id: number): Promise<Album | null> {
    return this.albumsRepository.findOne({
      where: { id },
      relations: {
        packs: true,
      },
    });
  }

  /**
   * Actualiza los datos de un álbum existente.
   * @param id Identificador del álbum.
   * @param updateAlbumDto Datos a actualizar.
   * @returns El álbum actualizado.
   */
  async update(id: number, updateAlbumDto: UpdateAlbumDto): Promise<Album | null> {
    await this.albumsRepository.update(id, updateAlbumDto);
    return this.findOne(id);
  }

  /**
   * Elimina un álbum y limpia sus recursos asociados en el almacenamiento.
   * @param id Identificador del álbum.
   */
  async remove(id: number): Promise<void> {
    const album = await this.findOne(id);

    if (!album) {
      throw new NotFoundException(`Album #${id} not found`);
    }

    await this.albumsRepository.delete(id);
    await this.uploadsService.removeAlbumDirectory(id);
  }

  /**
   * Calcula el progreso de completitud de un álbum para un usuario.
   * @param albumId Identificador del álbum.
   * @param userId Identificador del usuario.
   * @returns Objeto detallado con el progreso, stickers obtenidos y estado de ganador.
   */
  async getAlbumProgress(albumId: number, userId: number) {
    const album = await this.albumsRepository.findOne({
      where: { id: albumId },
    });

    if (!album) {
      throw new NotFoundException(`Album #${albumId} not found`);
    }

    const stickers = await this.stickersRepository.find({
      where: { album_id: albumId },
      order: { id: "ASC" },
    });

    const userAlbumStickers = await this.userAlbumStickersRepository.find({
      where: { user_id: userId, album_id: albumId },
    });

    const obtainedStickerIds = userAlbumStickers.map((item) => item.sticker_id);
    const total = stickers.length;
    const obtained = obtainedStickerIds.length;
    const completed = total > 0 && total === obtained;

    const winner = await this.winnersRepository.findOne({
      where: { user_id: userId, album_id: albumId },
    });

    return {
      album,
      stickers: stickers.map((sticker) => ({
        ...sticker,
        obtained: obtainedStickerIds.includes(sticker.id),
      })),
      progress: {
        total,
        obtained,
        percentage: total > 0 ? Math.round((obtained / total) * 100) : 0,
      },
      completed,
      winner,
    };
  }
}