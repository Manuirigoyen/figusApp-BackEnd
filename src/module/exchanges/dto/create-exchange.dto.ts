import { IsInt, IsNotEmpty } from 'class-validator';

/**
 * DTO para crear un nuevo Exchange.
 * Define la estructura y validaciones para POST /exchanges.
 */
export class CreateExchangeDto {
  /**
   * ID de la oferta involucrada en el exchange.
   * @example 1
   */
  @IsInt()
  @IsNotEmpty()
  offer_id!: number;

  /**
   * ID del usuario que acepta el exchange.
   * @example 5
   */
  @IsInt()
  @IsNotEmpty()
  accepter_user_id!: number;

  /**
   * ID de la wallet ofrecida.
   * @example 10
   */
  @IsInt()
  @IsNotEmpty()
  offered_wallet_id!: number;

  /**
   * ID de la wallet recibida.
   * @example 12
   */
  @IsInt()
  @IsNotEmpty()
  received_wallet_id!: number;

  /**
   * Cantidad ofrecida en el exchange.
   * @example 100
   */
  @IsInt()
  @IsNotEmpty()
  offered_quantity!: number;

  /**
   * Cantidad recibida en el exchange.
   * @example 50
   */
  @IsInt()
  @IsNotEmpty()
  received_quantity!: number;
}