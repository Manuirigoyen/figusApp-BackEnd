import { IsEnum, IsOptional } from 'class-validator';
import { OfferStatus } from '../entities/offer.entity';

/**
 * DTO para actualizar una Offer existente.
 * Define la estructura y validaciones para PUT /offers/:id.
 */
export class UpdateOfferDto {
  /**
   * Estado de la oferta (pending/accepted/rejected/expired).
   * @default OfferStatus.PENDING
   * @example 'accepted'
   */
  @IsEnum(OfferStatus)
  @IsOptional()
  status?: OfferStatus;
}