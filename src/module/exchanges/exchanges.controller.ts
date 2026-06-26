import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  ParseIntPipe,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ExchangesService } from './exchanges.service';
import { CreateExchangeDto } from './dto/create-exchange.dto';
import { UpdateExchangeDto } from './dto/update-exchange.dto';

/**
 * Controller REST para Exchange con endpoints CRUD completos.
 * Base path: /exchanges
 */
@Controller('exchanges')
export class ExchangesController {
  constructor(private readonly exchangesService: ExchangesService) {}

  @Post()
  /**
   * Crea nuevo exchange.
   * @body CreateExchangeDto
   */
  create(@Body() createExchangeDto: CreateExchangeDto) {
    return this.exchangesService.create(createExchangeDto);
  }

  @Get()
  /**
   * Lista todos los exchanges.
   */
  findAll() {
    return this.exchangesService.findAll();
  }

  @Get(':id')
  /**
   * Obtiene exchange por ID.
   * @param id ID del exchange
   */
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.exchangesService.findOne(id);
  }

  @Put(':id')
  /**
   * Actualiza exchange existente.
   * @param id ID del exchange
   * @body UpdateExchangeDto
   */
  update(@Param('id', ParseIntPipe) id: number, @Body() updateExchangeDto: UpdateExchangeDto) {
    return this.exchangesService.update(id, updateExchangeDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  /**
   * Elimina exchange (soft delete).
   * @param id ID del exchange
   */
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.exchangesService.remove(id);
  }

  @Get('user/:userId')
  /**
   * Lista exchanges por usuario aceptante.
   * @param userId ID del usuario
   */
  findByAccepterUserId(@Param('userId', ParseIntPipe) userId: number) {
    return this.exchangesService.findByAccepterUserId(userId);
  }

  @Get('offer/:offerId')
  /**
   * Lista exchanges por oferta.
   * @param offerId ID de la oferta
   */
  findByOfferId(@Param('offerId', ParseIntPipe) offerId: number) {
    return this.exchangesService.findByOfferId(offerId);
  }

  @Get('status/:status')
  /**
   * Filtra exchanges por estado.
   * @param status pending/completed/cancelled
   */
 findByStatus(@Param('status') status: string) {
  return this.exchangesService.findByStatus(status as any); 
}

  @Get('offer/:offerId/exists')
  /**
   * Verifica si existe exchange para oferta.
   * @param offerId ID de la oferta
   */
  existsByOfferId(@Param('offerId', ParseIntPipe) offerId: number) {
    return this.exchangesService.existsByOfferId(offerId);
  }

  @Get('user/:userId/count')
  /**
   * Cuenta exchanges de usuario.
   * @param userId ID del usuario
   */
  countByUserId(@Param('userId', ParseIntPipe) userId: number) {
    return this.exchangesService.countByUserId(userId);
  }

  @Get('pending/count')
  /**
   * Cuenta exchanges pendientes.
   */
  countPending() {
    return this.exchangesService.countPending();
  }
}