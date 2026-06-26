import { IsInt, IsNotEmpty, IsNumber, IsOptional, Min } from 'class-validator';

/**
 * DTO para crear una nueva compra.
 */
export class CreatePurchaseDto {
  /**
   * ID del usuario comprador.
   */
  @IsInt()
  @IsNotEmpty()
  user_id!: number;

  /**
   * ID de la tienda.
   */
  @IsInt()
  @IsNotEmpty()
  store_id!: number;

  /**
   * Cantidad de items comprados.
   */
  @IsInt()
  @IsNotEmpty()
  @Min(1)
  quantity!: number;

  /**
   * Total en USD.
   */
  @IsNumber()
  @IsNotEmpty()
  total_usd!: number;

  /**
   * Descuento aplicado en USD (opcional).
   */
  @IsNumber()
  @IsOptional()
  discount_usd?: number;
}