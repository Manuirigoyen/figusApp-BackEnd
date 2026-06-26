import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Exchange, ExchangeStatus } from './entities/exchanges.entity';
import { CreateExchangeDto } from './dto/create-exchange.dto';
import { UpdateExchangeDto } from './dto/update-exchange.dto';

/**
 * Servicio principal para operaciones CRUD de Exchange.
 * Maneja repository, validaciones y relaciones con User/Offer/Wallet.
 */
@Injectable()
export class ExchangesService {
  constructor(
    @InjectRepository(Exchange)
    private exchangeRepository: Repository<Exchange>,
  ) {}

  /**
   * Crea un nuevo exchange a partir del DTO.
   * @param createExchangeDto Datos del exchange a crear
   * @returns Exchange creado con ID generado
   */
  async create(createExchangeDto: CreateExchangeDto): Promise<Exchange> {
    const exchange = this.exchangeRepository.create(createExchangeDto);
    return await this.exchangeRepository.save(exchange);
  }

  /**
   * Retorna todos los exchanges con relaciones cargadas.
   * @returns Lista completa de exchanges
   */
  async findAll(): Promise<Exchange[]> {
    return await this.exchangeRepository.find({ 
      relations: ['user', 'offer', 'offeredWallet', 'receivedWallet'] 
    });
  }

  /**
   * Busca exchange por ID con validación de existencia.
   * @param id ID del exchange
   * @returns Exchange encontrado o error 404
   */
  async findOne(id: number): Promise<Exchange> {
    const exchange = await this.exchangeRepository.findOne({
      where: { id },
      relations: ['user', 'offer', 'offeredWallet', 'receivedWallet'],
    });
    if (!exchange) throw new NotFoundException(`Exchange #${id} not found`);
    return exchange;
  }

  /**
   * Lista exchanges de un usuario específico.
   * @param userId ID del usuario aceptante
   * @returns Exchanges del usuario
   */
  async findByAccepterUserId(userId: number): Promise<Exchange[]> {
    return await this.exchangeRepository.find({
      where: { accepter_user_id: userId },
      relations: ['user', 'offer', 'offeredWallet', 'receivedWallet'],
    });
  }

  /**
   * Lista exchanges de una oferta específica.
   * @param offerId ID de la oferta
   * @returns Exchanges de la oferta
   */
  async findByOfferId(offerId: number): Promise<Exchange[]> {
    return await this.exchangeRepository.find({
      where: { offer_id: offerId },
      relations: ['user', 'offer', 'offeredWallet', 'receivedWallet'],
    });
  }

  /**
   * Filtra exchanges por estado.
   * @param status Estado (completed/cancelled)
   * @returns Exchanges con estado específico
   */
  async findByStatus(status: ExchangeStatus): Promise<Exchange[]> {
    return await this.exchangeRepository.find({
      where: { status },
      relations: ['user', 'offer', 'offeredWallet', 'receivedWallet'],
    });
  }

  /**
   * Actualiza exchange mergeando propiedades.
   * @param id ID del exchange
   * @param updateExchangeDto Campos a actualizar
   * @returns Exchange actualizado
   */
  async update(id: number, updateExchangeDto: UpdateExchangeDto): Promise<Exchange> {
    const exchange = await this.findOne(id);
    Object.assign(exchange, updateExchangeDto);
    return await this.exchangeRepository.save(exchange);
  }

  /**
   * Elimina exchange.
   * @param id ID del exchange a eliminar
   */
  async remove(id: number): Promise<void> {
    await this.findOne(id);
    await this.exchangeRepository.softDelete(id);
  }

  /**
   * Verifica si existe exchange para una oferta.
   * @param offerId ID de la oferta
   * @returns true si existe
   */
  async existsByOfferId(offerId: number): Promise<boolean> {
    const count = await this.exchangeRepository.count({ where: { offer_id: offerId } });
    return count > 0;
  }

  /**
   * Cuenta los exchanges de un usuario.
   * @param userId ID del usuario
   * @returns Total de exchanges
   */
  async countByUserId(userId: number): Promise<number> {
    return await this.exchangeRepository.count({ where: { accepter_user_id: userId } });
  }

  /**
   * Cuenta los exchanges pendientes.
   * @returns Total pendientes
   */
  async countPending(): Promise<number> {
    return await this.exchangeRepository.count({ where: { status: ExchangeStatus.PENDING } });
  }

  /**
   * Reemplaza un exchange (intercambio) por otro.
   * @param id ID del exchange
   * @param updateExchangeDto Nuevos valores completos
   * @returns Exchange actualizado
   */
  async replaceUpdate(id: number, updateExchangeDto: UpdateExchangeDto): Promise<Exchange> {
    await this.findOne(id);
    await this.exchangeRepository.update(id, updateExchangeDto);
    return this.findOne(id);
  }
}