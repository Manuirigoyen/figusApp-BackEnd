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
  Query,
} from '@nestjs/common';
import { PurchasesService } from './purchases.service';
import { CreatePurchaseDto } from './dto/create-purchase.dto';
import { UpdatePurchaseDto } from './dto/update-purchase.dto';
import { Roles } from '../auth/decorators/roles.decorator';

/**
 * Controller REST para Purchase con endpoints CRUD completos.
 * Base path: /purchases
 */
@Controller('purchases')
export class PurchasesController {
  constructor(private readonly purchasesService: PurchasesService) {}

  /**
   * Crea nueva compra en el sistema.
   * @body CreatePurchaseDto
   */
  @Post()
  create(@Body() createPurchaseDto: CreatePurchaseDto) {
    return this.purchasesService.create(createPurchaseDto);
  }

  /**
   * Lista todas las compras registradas.
   */
  @Get()
  findAll() {
    return this.purchasesService.findAll();
  }

  /**
   * Lista compras asociadas a un usuario comprador.
   * @param userId ID del usuario
   */
  @Get('user/:userId')
  findByUserId(@Param('userId', ParseIntPipe) userId: number) {
    return this.purchasesService.findByUserId(userId);
  }

  /**
   * Lista compras pertenecientes a una tienda.
   * @param storeId ID de la tienda
   */
  @Get('store/:storeId')
  findByStoreId(@Param('storeId', ParseIntPipe) storeId: number) {
    return this.purchasesService.findByStoreId(storeId);
  }

  /**
   * Cuenta la cantidad de compras de un usuario.
   * @param userId ID del usuario
   */
  @Get('user/:userId/count')
  countByUserId(@Param('userId', ParseIntPipe) userId: number) {
    return this.purchasesService.countByUserId(userId);
  }

  /**
   * Obtiene el total monetario gastado por un usuario.
   * @param userId ID del usuario
   */
  @Get('user/:userId/total')
  totalSpentByUserId(@Param('userId', ParseIntPipe) userId: number) {
    return this.purchasesService.totalSpentByUserId(userId);
  }

  /**
   * Filtra las compras comprendidas en un rango de fechas.
   * @query start Fecha inicio (YYYY-MM-DD)
   * @query end Fecha fin (YYYY-MM-DD)
   */
  @Get('date-range')
  findByDateRange(
    @Query('start') start: string,
    @Query('end') end: string,
  ) {
    const startDate = new Date(start);
    const endDate = new Date(end);

    return this.purchasesService.findByDateRange(startDate, endDate);
  }

  /**
   * Obtiene los detalles de una compra por su ID.
   * @param id ID de la compra
   */
  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.purchasesService.findOne(id);
  }

  /**
   * Actualiza los metadatos de una compra existente.
   * @param id ID de la compra
   * @body UpdatePurchaseDto
   */
  @Roles('admin')
  @Put(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updatePurchaseDto: UpdatePurchaseDto,
  ) {
    return this.purchasesService.update(id, updatePurchaseDto);
  }

  /**
   * Elimina una compra del sistema mediante borrado lógico.
   * @param id ID de la compra
   */
  @Roles('admin')
  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.purchasesService.remove(id);
  }
}
