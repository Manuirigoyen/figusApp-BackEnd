import { IsEnum, IsOptional } from 'class-validator';
import { ExchangeStatus } from '../entities/exchanges.entity';

/**
 * DTO para actualizar un Exchange existente.
 * Define la estructura y validaciones para PUT /exchanges/:id.
 */
export class UpdateExchangeDto {
  /**
   * Estado del exchange (completed/cancelled).
   * @default ExchangeStatus.COMPLETED
   * @example 'cancelled'
   */
  @IsEnum(ExchangeStatus)
  @IsOptional()
  status?: ExchangeStatus;
}