import {
  Controller,
  Get,
  Post,
  Delete,
  Body,
  Param,
  ParseIntPipe,
  HttpCode,
  HttpStatus,
  Put,
} from '@nestjs/common';

import { PrizeService } from './prize.service';
import { CreatePrizeDto } from './dto/create-prize.dto';
import { UpdatePrizeDto } from './dto/update-prize.dto'; 

import { Public } from '../auth/decorators/public.decorator';
import { Roles } from '../auth/decorators/roles.decorator';

/**
 * Controller REST para Prize con endpoints CRUD.
 * Base path: /prizes
 *
 * Público: GET endpoints
 * Admin: POST, DELETE
 */
@Controller('prizes')
export class PrizeController {
  constructor(private readonly prizesService: PrizeService) {}

  /**
   * Crear nuevo premio.
   */
  @Roles('admin')
  @Post()
  create(@Body() createPrizeDto: CreatePrizeDto) {
    return this.prizesService.create(createPrizeDto);
  }

  /**
   * Obtener todos los premios.
   */
  @Public()
  @Get()
  findAll() {
    return this.prizesService.findAll();
  }

  /**
   * Obtener premio por ID.
   */
  @Public()
  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.prizesService.findOne(id);
  }

  /**
   * Actualizar un premio existente de forma parcial.
   */
  @Roles('admin')
  @Put(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updatePrizeDto: UpdatePrizeDto,
  ) {
    return this.prizesService.update(id, updatePrizeDto);
  }

  /**
   * Eliminar premio.
   */
  @Roles('admin')
  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.prizesService.remove(id);
  }
}