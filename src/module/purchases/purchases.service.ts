import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between } from 'typeorm';
import { Purchase } from './entities/purchase.entity';
import { CreatePurchaseDto } from './dto/create-purchase.dto';
import { UpdatePurchaseDto } from './dto/update-purchase.dto';

/**
 * Servicio principal para operaciones CRUD de Purchase.
 * Maneja repository, validaciones y relaciones con User/Store.
 */
@Injectable()
export class PurchasesService {
  constructor(
    @InjectRepository(Purchase)
    private purchaseRepository: Repository<Purchase>,
  ) {}

  /**
   * Crea una nueva compra a partir del DTO.
   * @param createPurchaseDto Datos de la compra a crear
   * @returns Purchase creada con ID generado
   */
  async create(createPurchaseDto: CreatePurchaseDto): Promise<Purchase> {
    const purchase = this.purchaseRepository.create(createPurchaseDto);
    return await this.purchaseRepository.save(purchase);
  }

  /**
   * Retorna todas las compras con relaciones cargadas.
   * @returns Lista completa de compras
   */
  async findAll(): Promise<Purchase[]> {
    return await this.purchaseRepository.find({ 
      relations: ['user', 'store'] 
    });
  }

  /**
   * Busca compra por ID con validación de existencia.
   * @param id ID de la compra
   * @returns Purchase encontrada o error 404
   */
  async findOne(id: number): Promise<Purchase> {
    const purchase = await this.purchaseRepository.findOne({
      where: { id },
      relations: ['user', 'store'],
    });
    if (!purchase) throw new NotFoundException(`Purchase #${id} not found`);
    return purchase;
  }

  /**
   * Lista compras por usuario comprador.
   * @param userId ID del usuario
   * @returns Compras del usuario
   */
  async findByUserId(userId: number): Promise<Purchase[]> {
    return await this.purchaseRepository.find({
      where: { user_id: userId },
      relations: ['user', 'store'],
    });
  }

  /**
   * Lista compras por tienda.
   * @param storeId ID de la tienda
   * @returns Compras de la tienda
   */
  async findByStoreId(storeId: number): Promise<Purchase[]> {
    return await this.purchaseRepository.find({
      where: { store_id: storeId },
      relations: ['user', 'store'],
    });
  }

  /**
   * Actualiza compra mergeando propiedades.
   * @param id ID de la compra
   * @param updatePurchaseDto Campos a actualizar
   * @returns Purchase actualizada
   */
  async update(id: number, updatePurchaseDto: UpdatePurchaseDto): Promise<Purchase> {
    const purchase = await this.findOne(id);
    Object.assign(purchase, updatePurchaseDto);
    return await this.purchaseRepository.save(purchase);
  }

  /**
   * Elimina compra (soft delete).
   * @param id ID de la compra a eliminar
   */
  async remove(id: number): Promise<void> {
    await this.findOne(id);
    await this.purchaseRepository.softDelete(id);
  }

  /**
   * Cuenta compras de usuario.
   * @param userId ID del usuario
   * @returns Total de compras
   */
  async countByUserId(userId: number): Promise<number> {
    return await this.purchaseRepository.count({ where: { user_id: userId } });
  }

  /**
   * Total gastado por usuario (con descuento).
   * @param userId ID del usuario
   * @returns Total neto en USD
   */
  async totalSpentByUserId(userId: number): Promise<number> {
    const result = await this.purchaseRepository
      .createQueryBuilder('purchase')
      .select('SUM(purchase.total_usd - purchase.discount_usd)', 'total')
      .where('purchase.user_id = :userId', { userId })
      .getRawOne();
    return parseFloat(result?.total || '0');
  }

  /**
   * Compras en rango de fechas.
   * @param start Fecha inicio
   * @param end Fecha fin
   */
  async findByDateRange(start: Date, end: Date): Promise<Purchase[]> {
    return await this.purchaseRepository.find({
      where: { 
        purchased_at: Between(start, end)
      },
      relations: ['user', 'store'],
    });
  }
}