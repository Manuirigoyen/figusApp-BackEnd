import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";

import { AlbumsService } from "./albums.service";
import { AlbumsController } from "./albums.controller";
import { Album } from "./entities/album.entity";
import { UserAlbumSticker } from "./entities/user-album-sticker.entity";
import { Winner } from "./entities/winner.entity";

import { Sticker } from "../stickers/entities/sticker.entity";
import { UploadsModule } from "../uploads/uploads.module";

/**
 * Módulo de Álbumes.
 * * Encapsula la lógica de negocio, controladores y repositorios necesarios para la gestión 
 * de álbumes, pegatinas (stickers) y ganadores.
 */
@Module({
  imports: [
    /**
     * Registro de los repositorios de TypeORM para las entidades del módulo.
     */
    TypeOrmModule.forFeature([
      Album,
      Sticker,
      UserAlbumSticker,
      Winner,
    ]),
    UploadsModule,
  ],
  controllers: [AlbumsController],
  providers: [AlbumsService],
  exports: [AlbumsService],
})
export class AlbumsModule {}