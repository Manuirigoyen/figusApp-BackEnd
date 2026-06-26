import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Put,
  HttpCode,
  HttpStatus,
  UseGuards,
} from "@nestjs/common";

import { AlbumsService } from "./albums.service";
import { CreateAlbumDto } from "./dto/create-album.dto";
import { UpdateAlbumDto } from "./dto/update-album.dto";
import { Public } from "../auth/decorators/public.decorator";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import { RolesGuard } from "../auth/guards/roles.guard";
import { Roles } from "../auth/decorators/roles.decorator";

/**
 * Controlador de Álbumes.
 * * Expone los endpoints REST para la gestión de álbumes y la consulta de progreso
 * de los usuarios, aplicando políticas de acceso mediante Guards y roles.
 */
@Controller("albums")
export class AlbumsController {
  constructor(private readonly albumsService: AlbumsService) {}

  /**
   * Obtiene la lista completa de álbumes.
   * * @returns {Promise<Album[]>} Lista de álbumes disponibles.
   */
  @Public()
  @Get()
  findAll() {
    return this.albumsService.findAll();
  }

  /**
   * Endpoint de prueba para verificar el estado del controlador.
   * * @returns {Object} Mensaje de confirmación.
   */
  @Public()
  @Get("test")
  test() {
    return { message: "Albums controller funcionando" };
  }

  /**
   * Consulta el progreso de un usuario específico en un álbum determinado.
   * * @param albumId Identificador del álbum.
   * * @param userId Identificador del usuario.
   * * @returns {Promise<any>} Objeto con el estado del progreso y stickers.
   */
  @Public()
  @Get(":albumId/progress/user/:userId")
  getAlbumProgress(
    @Param("albumId", ParseIntPipe) albumId: number,
    @Param("userId", ParseIntPipe) userId: number,
  ) {
    return this.albumsService.getAlbumProgress(albumId, userId);
  }

  /**
   * Obtiene un álbum específico mediante su identificador.
   * * @param id ID único del álbum.
   * * @returns {Promise<Album>} El álbum solicitado.
   */
  @Public()
  @Get(":id")
  findOne(@Param("id", ParseIntPipe) id: number) {
    return this.albumsService.findOne(id);
  }

  /**
   * Crea un nuevo álbum. (Solo accesible por administradores).
   * * @param createAlbumDto Datos para la creación del álbum.
   * * @returns {Promise<Album>} El álbum recién creado.
   */
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles("admin")
  @Post()
  create(@Body() createAlbumDto: CreateAlbumDto) {
    return this.albumsService.create(createAlbumDto);
  }

  /**
   * Actualiza la información de un álbum existente. (Solo accesible por administradores).
   * * @param id ID del álbum a actualizar.
   * * @param updateAlbumDto Datos para la actualización.
   * * @returns {Promise<Album>} El álbum actualizado.
   */
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles("admin")
  @Put(":id")
  update(
    @Param("id", ParseIntPipe) id: number,
    @Body() updateAlbumDto: UpdateAlbumDto,
  ) {
    return this.albumsService.update(id, updateAlbumDto);
  }

  /**
   * Elimina un álbum del sistema. (Solo accesible por administradores).
   * * @param id ID del álbum a eliminar.
   * * @returns {void} No retorna contenido.
   */
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles("admin")
  @Delete(":id")
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param("id", ParseIntPipe) id: number) {
    return this.albumsService.remove(id);
  }
}