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
  UseGuards 
} from "@nestjs/common";
import { StickersService } from "./stickers.service";
import { CreateStickerDto } from "./dto/create-sticker.dto";
import { UpdateStickerDto } from "./dto/update-sticker.dto";
import { Public } from "../auth/decorators/public.decorator";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import { RolesGuard } from "../auth/guards/roles.guard";
import { Roles } from "../auth/decorators/roles.decorator";

/**
 * Controller REST para Sticker con endpoints CRUD completos.
 * Base path: /stickers
 * 
 * Público: GET(), GET/:id
 * Admin + JWT: POST(), PUT/:id, DELETE/:id
 */
@Controller("stickers")
export class StickersController {
  constructor(private readonly stickersService: StickersService) {}

  /**
   * Lista todos los stickers (PÚBLICO).
   */
  @Public()
  @Get()
  findAll() {
    return this.stickersService.findAll();
  }

  /**
   * Obtiene sticker por ID (PÚBLICO).
   * @param id ID del sticker
   */
  @Public()
  @Get(":id")
  findOne(@Param("id", ParseIntPipe) id: number) {
    return this.stickersService.findOne(id);
  }

  /**
   * Crea nuevo sticker (Admin + JWT requerido).
   * @body CreateStickerDto
   */
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @Post()
  create(@Body() createStickerDto: CreateStickerDto) {
    return this.stickersService.create(createStickerDto);
  }

  /**
   * Actualiza sticker existente (Admin + JWT requerido).
   * @param id ID del sticker
   * @body UpdateStickerDto
   */
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @Put(":id")
  update(@Param("id", ParseIntPipe) id: number, @Body() updateStickerDto: UpdateStickerDto) {
    return this.stickersService.update(id, updateStickerDto);
  }

  /**
   * Elimina sticker (Admin + JWT requerido).
   * @param id ID del sticker
   */
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @Delete(":id")
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param("id", ParseIntPipe) id: number) {
    return this.stickersService.remove(id);
  }
}