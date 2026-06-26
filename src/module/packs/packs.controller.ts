import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  HttpCode,
  HttpStatus,
  UseGuards,
} from "@nestjs/common";
import { PacksService } from "./packs.service";
import { CreatePackDto } from "./dto/create-pack.dto";
import { UpdatePackDto } from "./dto/update-pack.dto";
import { Public } from "../auth/decorators/public.decorator";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import { RolesGuard } from "../auth/guards/roles.guard";
import { Roles } from "../auth/decorators/roles.decorator";

/**
 * Controller REST para Pack con endpoints CRUD completos.
 * Base path: /packs
 *
 * Público: GET(), GET/:id
 * Admin + JWT: POST(), PATCH/:id, DELETE/:id
 */
@Controller("packs")
export class PacksController {
  constructor(private readonly packsService: PacksService) { }

  /**
   * Lista todos los packs (PÚBLICO).
   */
  @Public()
  @Get()
  findAll() {
    return this.packsService.findAll();
  }

  /**
   * Obtiene pack por ID (PÚBLICO).
   * @param id ID del pack
   */
  @Public()
  @Get(":id")
  findOne(@Param("id", ParseIntPipe) id: number) {
    return this.packsService.findOne(id);
  }

  /**
   * Crea nuevo pack (Admin + JWT requerido).
   * @body CreatePackDto
   */
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles("admin")
  @Post()
  create(@Body() createPackDto: CreatePackDto) {
    return this.packsService.create(createPackDto);
  }

  /**
   * Actualiza pack existente (Admin + JWT requerido).
   * @param id ID del pack
   * @body UpdatePackDto
   */
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles("admin")
  @Patch(":id")
  update(
    @Param("id", ParseIntPipe) id: number,
    @Body() updatePackDto: UpdatePackDto,
  ) {
    return this.packsService.update(id, updatePackDto);
  }

  /**
   * Elimina pack (Admin + JWT requerido).
   * @param id ID del pack
   */
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles("admin")
  @Delete(":id")
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param("id", ParseIntPipe) id: number) {
    return this.packsService.remove(id);
  }
}
